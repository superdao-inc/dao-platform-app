import { Module } from '@nestjs/common';

import { KafkaModule } from 'src/services/kafka/kafka.module';

import { TransactionBrokerService } from './transactionBroker.service';

@Module({
	imports: [KafkaModule],
	providers: [TransactionBrokerService],
	exports: [TransactionBrokerService]
})
export class TransactionBrokerModule {}
