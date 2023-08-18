import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoService } from 'src/entities/dao/dao.service';
import { DaoResolver } from 'src/entities/dao/dao.resolver';
import { CollectionsModule } from 'src/entities/collections/collections.module';

import { PostModule } from 'src/entities/post/post.module';
import { ProposalModule } from 'src/entities/proposal/proposal.module';
import { DaoMembership } from 'src/entities/daoMembership/daoMembership.model';
import { ContractModule } from 'src/entities/contract/contract.module';
import { Post } from 'src/entities/post/post.model';
import { DaoAnalytics } from 'src/entities/daoAnalytics/daoAnalytics.model';
import { WalletModule } from 'src/entities/wallet/wallet.module';
import { CompositeBlockchainModule } from 'src/services/blockchain/blockchain.module';
import { EthersModule } from 'src/services/ethers/ethers.module';
import { TransactionBrokerModule } from 'src/services/messageBroker/transaction/transactionBroker.module';
import { GraphModule } from 'src/services/the-graph/graph-polygon/graph.module';
import { DaoMembershipModule } from '../daoMembership/dao-membership.module';
import { ReferralCampaign } from '../referral/models/referralCampaign.model';
import { ReferralLink } from '../referral/models/referralLink.model';
import { TreasuryModule } from '../treasury/treasury.module';
import { LinksModule } from '../links/links.module';
import { Links } from '../links/links.model';
import { User } from '../user/user.model';
import { Dao } from './dao.model';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Links, Dao, Post, DaoMembership, DaoAnalytics, ReferralCampaign, ReferralLink]),
		forwardRef(() => CollectionsModule),
		forwardRef(() => PostModule),
		forwardRef(() => ContractModule),
		forwardRef(() => DaoMembershipModule),
		forwardRef(() => WalletModule),
		forwardRef(() => ProposalModule),
		forwardRef(() => TreasuryModule),
		LinksModule,
		CompositeBlockchainModule,
		EthersModule,
		TransactionBrokerModule,
		GraphModule
	],
	providers: [DaoService, DaoResolver],
	exports: [TypeOrmModule, DaoService]
})
export class DaoModule {}
