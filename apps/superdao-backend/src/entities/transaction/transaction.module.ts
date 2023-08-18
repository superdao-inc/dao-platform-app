import { Module } from '@nestjs/common';
import { BlockchainModule } from 'src/entities/blockchain/blockchain.module';
import { WhitelistModule } from 'src/entities/whitelist/whitelist.module';
import { NftModule } from 'src/entities/nft/nft.module';
import { ContractModule } from 'src/entities/contract/contract.module';
import { DaoModule } from 'src/entities/dao/dao.module';
import { NftAdminModule } from 'src/entities/nftAdmin/nftAdmin.module';
import { TransactionService } from './transaction.service';
import { TransactionResolver } from './transaction.resolver';
import { DaoMembershipModule } from '../daoMembership/dao-membership.module';
import { TransactionBrokerModule } from 'src/services/messageBroker/transaction/transactionBroker.module';

@Module({
	imports: [
		BlockchainModule,
		WhitelistModule,
		NftModule,
		ContractModule,
		DaoModule,
		DaoMembershipModule,
		NftAdminModule,
		TransactionBrokerModule
	],
	providers: [TransactionService, TransactionResolver],
	exports: [TransactionService]
})
export class TransactionModule {}
