import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

import type { TransactionMessage } from 'src/entities/blockchain/types';
import { log } from 'src/utils/logger';
import { Topics } from '../kafka/topics';
import { TransactionBrokerService } from '../messageBroker/transaction/transactionBroker.service';
import { ConsumersService } from './consumers.service';

@Controller()
export class ConsumersController {
	constructor(
		private readonly consumersService: ConsumersService,
		private readonly transactionBrokerService: TransactionBrokerService
	) {}

	@EventPattern(Topics.Transaction)
	processKafkaMessage(msg: TransactionMessage) {
		log.info(`[ConsumersController] Consuming message from Kafka:`, { msg });

		const ackCallback = () => {};
		const nackCallback = () => {
			this.transactionBrokerService.trackKafkaTransaction({ ...msg, status: 'AWAIT_CONFIRMATION' });
		};

		this.consumersService.processTransaction(msg, ackCallback, nackCallback);
	}
}
