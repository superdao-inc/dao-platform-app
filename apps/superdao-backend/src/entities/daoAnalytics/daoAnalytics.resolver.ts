import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { DaoAnalytics } from './daoAnalytics.model';

import { DaoAnalyticsService } from 'src/entities/daoAnalytics/daoAnalytics.service';
import { AuthGuard } from 'src/auth.guard';
import { DaoMaskType } from 'src/entities/daoAnalytics/daoAnalytics.types';

@Resolver(() => DaoAnalytics)
export class DaoAnalyticsResolver {
	constructor(private daoAnalyticsService: DaoAnalyticsService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => DaoAnalytics)
	async createDaoAnalytics(
		@Args('daoId') daoId: string,
		@Args({ name: 'mask', type: () => DaoMaskType }) mask: DaoMaskType
	) {
		return this.daoAnalyticsService.createAnalytics(daoId, mask);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => DaoAnalytics)
	async updateDaoAnalytics(@Args('id') id: string, @Args({ name: 'mask', type: () => DaoMaskType }) mask: DaoMaskType) {
		return this.daoAnalyticsService.updateAnalytics(id, mask);
	}

	@UseGuards(AuthGuard)
	@Query(() => DaoAnalytics, { nullable: true })
	async daoAnalyticsByDaoId(@Args('daoId') daoId: string) {
		return this.daoAnalyticsService.analyticsByDaoId(daoId);
	}
}
