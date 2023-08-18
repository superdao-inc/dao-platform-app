import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/entities/user/user.model';
import { BlockchainModule } from 'src/entities/blockchain/blockchain.module';
import { CollectionsModule } from 'src/entities/collections/collections.module';
import { NftCollectionsService } from 'src/entities/nft/nftCollections.service';
import { DaoModule } from 'src/entities/dao/dao.module';
import { ContractModule } from 'src/entities/contract/contract.module';
import { WhitelistModule } from 'src/entities/whitelist/whitelist.module';
import { Dao } from 'src/entities/dao/dao.model';
import { wallet } from 'src/blockchain/common';
import { EmailModule } from 'src/services/email/email.module';
import { EthersModule } from 'src/services/ethers/ethers.module';
import { EmailVerificationModule } from 'src/services/emailVerification/emailVerification.module';
import { Kernel__factory } from 'src/typechain';
import { TransactionBrokerModule } from 'src/services/messageBroker/transaction/transactionBroker.module';
import { CompositeBlockchainModule } from 'src/services/blockchain/blockchain.module';
import { NftResolver } from './nft.resolver';
import { NftService } from './nft.service';
import { NftClientService } from './nft-client.service';
import { TransactionsLoggingModule } from '../logging/logging.module';
import { EmailSettingsModule } from '../emailSettings/emailSettings.module';
import { TransactionMetricsModule } from 'src/services/transacton-metrics/transaction-metrics.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Dao]),
		BlockchainModule,
		CollectionsModule,
		CollectionsModule,
		ContractModule,
		DaoModule,
		EmailModule,
		EmailSettingsModule,
		EmailVerificationModule,
		EthersModule,
		TransactionBrokerModule,
		TransactionMetricsModule,
		TransactionsLoggingModule,
		WhitelistModule,
		CompositeBlockchainModule
	],
	providers: [
		NftService,
		NftCollectionsService,
		NftClientService,
		NftResolver,
		{
			provide: Kernel__factory,
			useValue: new Kernel__factory(wallet)
		}
	],
	exports: [NftService, NftCollectionsService, NftClientService]
})
export class NftModule {}
