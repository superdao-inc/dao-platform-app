import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import express from 'express';

import { AuthGuard } from 'src/auth.guard';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
import { AchievementsService } from 'src/entities/achievements/achievements.service';
import {
	RoadmapLevel,
	AchievementsUserProgress,
	AchievementTierWithOwners,
	LeaderboardMember
} from 'src/entities/achievements/achievements.types';
import { UpdateRoadmapInput } from 'src/entities/achievements/dto/updateRoadmap.dto';
import { UserService } from 'src/entities/user/user.service';
import { AddressValidationPipe } from 'src/pipes/addressValidation.pipe';
import { NotFoundError } from 'src/exceptions';

@Resolver()
export class AchievementsResolver {
	constructor(
		private readonly achievementsService: AchievementsService,
		private readonly daoMembershipService: DaoMembershipService,
		private readonly userService: UserService
	) {}

	@Query(() => AchievementTierWithOwners)
	async getAchievementTier(@Args('daoAddress') daoAddress: string, @Args('tier') tier: string) {
		return this.achievementsService.getAchievementTier(daoAddress, tier);
	}

	@Query(() => [AchievementTierWithOwners])
	async getAchievementTiers(@Args('daoAddress') daoAddress: string) {
		return this.achievementsService.getAchievementTiers(daoAddress);
	}

	@UseGuards(AuthGuard)
	@Query(() => [AchievementTierWithOwners])
	async getUserAchievementTiers(
		@Args('daoAddress') daoAddress: string,
		@Args('owner', new AddressValidationPipe()) ownerAddress: string
	) {
		return this.achievementsService.getUserAchievementTiers(daoAddress, ownerAddress);
	}

	@Query(() => [LeaderboardMember])
	async getAchievementsLeaderboard(@Args('daoId') daoId: string, @Args('search') search: string = '') {
		return this.achievementsService.getLeaderboard(daoId, search);
	}

	@Query(() => AchievementsUserProgress)
	async getAchievementsUserProgress(@Args('daoId') daoId: string, @Args('userId') userId: string) {
		const user = await this.userService.findByIdOrSlug(userId);
		if (!user) throw new NotFoundError();

		return this.achievementsService.getAchievementsUserProgress(daoId, user.walletAddress);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => [RoadmapLevel])
	async updateRoadmap(
		@Args('updateRoadmapData') updateRoadmapInput: UpdateRoadmapInput,
		@Context('req') ctx: express.Request
	) {
		const userId = ctx.session?.userId;
		await this.daoMembershipService.checkAccess(userId, updateRoadmapInput.daoId, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);

		return await this.achievementsService.updateRoadmap(updateRoadmapInput);
	}
}
