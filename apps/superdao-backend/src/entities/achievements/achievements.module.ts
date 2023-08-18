import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { GraphModule } from 'src/services/the-graph/graph-polygon/graph.module';
import { CompositeBlockchainModule } from 'src/services/blockchain/blockchain.module';

import { BlockchainModule } from 'src/entities/blockchain/blockchain.module';
import { DaoModule } from 'src/entities/dao/dao.module';
import { DaoMembershipModule } from 'src/entities/daoMembership/dao-membership.module';
import { UserModule } from 'src/entities/user/user.module';
import { NftModule } from 'src/entities/nft/nft.module';

import { AchievementsFetcher } from './achievements.fetcher';
import { AchievementsResolver } from './achievements.resolver';
import { AchievementsService } from './achievements.service';

@Module({
	imports: [
		DaoModule,
		DaoMembershipModule,
		GraphModule,
		HttpModule,
		UserModule,
		BlockchainModule,
		NftModule,
		CompositeBlockchainModule
	],
	providers: [AchievementsService, AchievementsResolver, AchievementsFetcher],
	exports: [AchievementsService]
})
export class AchievementsModule {}
