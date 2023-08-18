import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

import { TransactionMessage } from 'src/entities/blockchain/types';
import { log } from 'src/utils/logger';
import { KAFKA_CLIENT_SERVICE } from './constants';
import { Topics } from './topics';

@Injectable()
export class ProducerService {
	constructor(@Inject(KAFKA_CLIENT_SERVICE) private readonly client: ClientKafka) {}

	async onApplicationBootstrap() {
		await this.client.connect();
	}

	private async publish(topic: Topics, msg: Record<string, any>) {
		try {
			this.client.emit(topic, msg);
			log.info(`[ProducerService] Sent message to Kafka:`, { msg });
		} catch (e) {
			log.error(`[ProducerService] Failed to send message to Kafka`, { error: e, msg });
		}
	}

	async publishTransaction(msg: TransactionMessage) {
		this.publish(Topics.Transaction, msg);
	}
}
