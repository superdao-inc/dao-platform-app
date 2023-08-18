import { Injectable } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { delayedVotingEventKey } from 'src/constants';

import { rabbitMqService } from 'src/services/rabbit/rabbitMqService';
import { DelayedVotingEventMessage, MessageType } from 'src/services/voting/types';

@Injectable()
export class DelayedMessageBrokerService {
	constructor() {}

	async initDelayedMessagesConsumer(
		queue: string,
		consumerTag: string,
		processor: (msg: ConsumeMessage, ackCallback: () => void) => Promise<void>
	) {
		await rabbitMqService.createDelayedConsumer(queue, consumerTag, processor);
	}

	// rabbitMQ delayed messages
	// handler: apps/superdao-backend/src/services/consumers/consumers.service.ts
	async trackRabbitMQDelayedMessage(msg: DelayedVotingEventMessage, msgDelay: number) {
		// + 1000ms because we work at JavaScript
		await rabbitMqService.sendDelayedMessage(delayedVotingEventKey, delayedVotingEventKey, msg, msgDelay + 1000);
	}

	async trackVotingDelayedMessage(data: DelayedVotingEventMessage['data'], msgDelay: number) {
		const msg: DelayedVotingEventMessage = {
			type: MessageType.DELAYED_VOTING_EVENT,
			data
		};

		await this.trackRabbitMQDelayedMessage(msg, msgDelay);
	}
}
