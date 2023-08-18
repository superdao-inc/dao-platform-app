import amqplib, { Channel, Connection, ConsumeMessage } from 'amqplib';

import { config } from 'src/config';
import { log } from 'src/utils/logger';

const {
	rabbitMq: { port, hostname, username, password, vhost }
} = config;

/**
 * Service should be initialized at the time, when server starts
 */

interface ConsumerCall {
	queue: string;
	consumerTag: string;
	processMessage: (msg: ConsumeMessage, ackCallback: () => void, nackCallback: () => void) => Promise<void>;
}

interface DelayConsumerCall {
	queue: string;
	consumerTag: string;
	processMessage: (msg: ConsumeMessage, ackCallback: () => void) => Promise<void>;
}

export class Rabbit {
	private static RECONNECT_DELAY = 5000;
	private connection: Connection;
	private connectionWasEstablished: boolean = false;

	private consumersMap = new Map<string, Channel>();
	private consumers: ConsumerCall[] = [];
	private delayConsumers: DelayConsumerCall[] = [];

	private stopSignalReceived: boolean = false;

	async init() {
		this.connection = await amqplib.connect({
			port,
			hostname,
			username,
			password,
			heartbeat: 10,
			vhost
		});

		if (this.connectionWasEstablished) {
			log.info('[AMQP] Creating previous connection consumers...');

			for (let { queue, consumerTag, processMessage } of this.consumers) {
				await this.internalCreateConsumer(queue, consumerTag, processMessage);
			}

			for (let { queue, consumerTag, processMessage } of this.delayConsumers) {
				await this.internalCreateDelayedConsumer(queue, consumerTag, processMessage);
			}
			log.info('[AMQP] Previous connection consumers were successfully created...');
		} else {
			this.connectionWasEstablished = true;

			process.once('SIGINT', async () => {
				this.stopSignalReceived = true;
				await this.connection.close();
			});
		}

		this.connection.on('error', (err) => {
			if (err.message !== 'Connection closing') {
				log.error('[AMQP] conn error', { message: err.message });
			}
		});

		this.connection.on('close', () => {
			log.warn('[AMQP] connection was closed');
			const scheduleReconnect = () => {
				if (this.stopSignalReceived) return;
				log.warn(`[AMQP] will reconnect after ${Rabbit.RECONNECT_DELAY} ms`);
				setTimeout(async () => {
					log.warn('[AMQP] reconnecting');
					try {
						await this.init();
					} catch (err) {
						log.error('[AMPQ] cannot reconnect', { message: (err as Error)?.message });
						scheduleReconnect();
					}
				}, Rabbit.RECONNECT_DELAY);
			};

			scheduleReconnect();
		});
	}

	private async internalCreateDelayedConsumer(
		queue: string,
		consumerTag: string,
		processMessage: (msg: ConsumeMessage, ackCallback: () => void) => Promise<void>
	) {
		const channel = await this.connection.createChannel();
		await channel.prefetch(10);

		this.consumersMap.set(consumerTag, channel);
		await channel.assertQueue(queue, { durable: true });

		await channel.consume(
			queue,
			async (msg) => {
				if (!msg) return;

				const ackCallback = () => channel.ack(msg);

				await processMessage(msg, ackCallback);
			},
			{
				consumerTag,
				noAck: false
			}
		);
	}

	async createDelayedConsumer(
		queue: string,
		consumerTag: string,
		processMessage: (msg: ConsumeMessage, ackCallback: () => void) => Promise<void>
	) {
		this.delayConsumers.push({ queue, consumerTag, processMessage });
		return this.internalCreateDelayedConsumer(queue, consumerTag, processMessage);
	}

	private async internalCreateConsumer(
		queue: string,
		consumerTag: string,
		processMessage: (msg: ConsumeMessage, ackCallback: () => void, nackCallback: () => void) => Promise<void>
	) {
		const channel = await this.connection.createChannel();
		await channel.prefetch(10);

		this.consumersMap.set(consumerTag, channel);
		await channel.assertQueue(queue, { durable: true });

		await channel.consume(
			queue,
			async (msg) => {
				if (!msg) return;

				const ackCallback = () => channel.ack(msg);
				const nackCallback = async () => channel.reject(msg, true);

				await processMessage(msg, ackCallback, nackCallback);
			},
			{
				consumerTag,
				noAck: false
			}
		);
	}

	async createConsumer(
		queue: string,
		consumerTag: string,
		processMessage: (msg: ConsumeMessage, ackCallback: () => void, nackCallback: () => void) => Promise<void>
	) {
		this.consumers.push({ queue, consumerTag, processMessage });
		return this.internalCreateConsumer(queue, consumerTag, processMessage);
	}

	async destroyConsumer(consumerTag: string) {
		if (this.consumersMap.has(consumerTag)) {
			const consumer = this.consumersMap.get(consumerTag);
			await consumer?.close();
			this.consumersMap.delete(consumerTag);
		}
	}

	sendMessage = async <T>(queue: string, msg: T) => {
		const channel = await this.connection.createChannel();
		const stringifyMsg = JSON.stringify(msg);

		try {
			await channel.assertExchange(queue, 'direct', { durable: true });
			await channel.assertQueue(queue, {
				durable: true
			});
			channel.sendToQueue(queue, Buffer.from(stringifyMsg));
		} catch (e: any) {
			log.error('RabbitMQ: error in publishing message', { message: e.message, stack: e.stack });
		} finally {
			await channel.close();
		}
	};

	sendDelayedMessage = async <T>(exchange: string, queue: string, msg: T, delay: number) => {
		const channel = await this.connection.createChannel();
		const stringifyMsg = JSON.stringify(msg);

		try {
			await channel.assertExchange(queue, 'x-delayed-message', {
				durable: true,
				arguments: { 'x-delayed-type': 'direct' }
			});

			await channel.bindQueue(queue, exchange, queue);

			channel.publish(exchange, queue, Buffer.from(stringifyMsg), {
				headers: {
					'x-delay': delay
				}
			});
		} catch (e: any) {
			log.error('RabbitMQ: error in publishing message', { message: e.message, stack: e.stack });
		} finally {
			await channel.close();
		}
	};
}

export const rabbitMqService = new Rabbit();
