import { Module } from '@nestjs/common';

import { ConsumersService } from 'src/services/consumers/consumers.service';
import { ProposalModule } from 'src/entities/proposal/proposal.module';
import { BlockchainModule } from 'src/entities/blockchain/blockchain.module';
import { WhitelistModule } from 'src/entities/whitelist/whitelist.module';
import { NftModule } from 'src/entities/nft/nft.module';
import { DaoModule } from 'src/entities/dao/dao.module';
import { TransactionModule } from 'src/entities/transaction/transaction.module';
import { ReferralModule } from 'src/entities/referral/referral.module';
import { NftAdminModule } from 'src/entities/nftAdmin/nftAdmin.module';
import { TransactionsLoggingModule } from 'src/entities/logging/logging.module';

import { ConsumersController } from './consumers.controller';

import { KafkaModule } from '../kafka/kafka.module';
import { CompositeBlockchainModule } from '../blockchain/blockchain.module';
import { TransactionBrokerModule } from '../messageBroker/transaction/transactionBroker.module';
import { DelayedMessageBrokerModule } from '../messageBroker/delayedMessage/delayedMessage.module';
import { TransactionMetricsModule } from '../transacton-metrics/transaction-metrics.module';
import { WebhookModule } from '../webhook/webhook.module';

@Module({
	imports: [
		ProposalModule,
		BlockchainModule,
		WhitelistModule,
		NftModule,
		DaoModule,
		TransactionModule,
		KafkaModule,
		ReferralModule,
		NftAdminModule,
		CompositeBlockchainModule,
		TransactionBrokerModule,
		DelayedMessageBrokerModule,
		TransactionMetricsModule,
		TransactionsLoggingModule,
		WebhookModule
	],
	providers: [ConsumersService],
	controllers: [ConsumersController]
})
export class ConsumersModule {}
