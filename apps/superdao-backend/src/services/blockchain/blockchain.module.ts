import { Module } from '@nestjs/common';

import { CompositeBlockchainService } from './blockchain.service';
import { BlockchainDaoModule } from './dao/dao.module';
import { BlockchainMembershipModule } from './membership/membership.module';
import { BlockchainCollectionModule } from './collection/collection.module';
import { BlockchainTransactionModule } from './transaction/transaction.module';
import { BlockchainTreasuryModule } from './treasury/treasury.module';

// this is migration module from go to ts in our app
// please don't believe git blame
// the code inside it de-facto uses blockchain, the Graph and IPFS data
// TODO: refactor it to separate micro-service (maybe - if we migrate to supergraph)

@Module({
	imports: [
		BlockchainTreasuryModule,
		BlockchainTransactionModule,
		BlockchainDaoModule,
		BlockchainCollectionModule,
		BlockchainMembershipModule
	],
	providers: [CompositeBlockchainService],
	exports: [CompositeBlockchainService]
})
export class CompositeBlockchainModule {}
