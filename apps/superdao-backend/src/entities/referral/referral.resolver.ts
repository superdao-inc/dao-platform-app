import express from 'express';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { AuthGuard } from 'src/auth.guard';
import { ReferralService } from './referral.service';
import { ReferralCampaign } from './models/referralCampaign.model';
import { ReferralLink } from './models/referralLink.model';
import { NotFoundError } from 'src/exceptions';
import { UserService } from '../user/user.service';
import { AmbassadorStatusResponse, ClaimReferralNftResponse } from './referral.dto';

@Resolver()
export class ReferralResolver {
	constructor(private referralCampaignService: ReferralService, private readonly userService: UserService) {}

	@Query(() => ReferralCampaign, { nullable: true })
	async referralCampaignByShortId(@Args('referralCampaignShortId') referralCampaignShortId: string) {
		return this.referralCampaignService.campaignByShortId(referralCampaignShortId);
	}

	@UseGuards(AuthGuard)
	@Query(() => [ReferralLink], { nullable: true })
	async referralLinks(
		@Args({ name: 'referralCampaignShortId', nullable: true, type: () => String })
		referralCampaignShortId: string | null,
		@Context('req') ctx: express.Request
	) {
		const currentUser = await this.userService.getUserById(ctx.session?.userId);
		if (!currentUser) throw new NotFoundError('User not found');

		const campaign = referralCampaignShortId
			? await this.referralCampaignByShortId(referralCampaignShortId)
			: undefined;

		const wallets = [currentUser.walletAddress];

		return this.referralCampaignService.linksByWallets(wallets, campaign?.id);
	}

	@UseGuards(AuthGuard)
	@Query(() => AmbassadorStatusResponse)
	async ambassadorStatus(
		@Args({ name: 'referralCampaignShortId', nullable: true, type: () => String })
		referralCampaignShortId: string | null,

		@Args({ name: 'claimSecret', nullable: true, type: () => String })
		claimSecret: string | null,

		@Context('req') ctx: express.Request
	): Promise<AmbassadorStatusResponse> {
		const currentUser = await this.userService.getUserById(ctx.session?.userId);
		if (!currentUser) throw new NotFoundError('User not found');

		const campaign = referralCampaignShortId
			? await this.referralCampaignByShortId(referralCampaignShortId)
			: undefined;

		if (!campaign) throw new NotFoundError('Campaign not found');

		const message = await this.referralCampaignService.getAmbassadorStatus(
			campaign.id,
			campaign.daoId,
			currentUser.walletAddress,
			campaign.tier,
			claimSecret
		);

		return {
			message
		};
	}

	@Query(() => ReferralLink, { nullable: true })
	async referralLinkByShortId(@Args('shortId') shortId: string) {
		return this.referralCampaignService.linkByShortId(shortId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => ClaimReferralNftResponse)
	async claimReferralNft(
		@Args('referralLinkShortId') referralLinkShortId: string,

		@Context('req') ctx: express.Request
	): Promise<ClaimReferralNftResponse> {
		const currentUser = await this.userService.getUserById(ctx.session?.userId);
		if (!currentUser) throw new NotFoundError('User not found');

		const link = await this.referralLinkByShortId(referralLinkShortId);

		if (!link) throw new NotFoundError(`Referral link ${referralLinkShortId} not found`);

		return this.referralCampaignService.claimReferralNft(
			link.referralCampaign.daoId,
			currentUser.walletAddress,
			link.referralCampaign.tier,
			link.id,
			currentUser.id,
			link.referralCampaign.id,
			link.referralCampaign.defaultLimit
		);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => ClaimReferralNftResponse)
	async claimAmbassadorNft(
		@Args('referralCampaignId') referralCampaignId: string,
		@Args({ name: 'claimSecret', nullable: true, type: () => String })
		claimSecret: string | null,
		@Context('req') ctx: express.Request
	): Promise<ClaimReferralNftResponse> {
		const currentUser = await this.userService.getUserById(ctx.session?.userId);
		if (!currentUser) throw new NotFoundError('User not found');

		const campaign = await this.referralCampaignService.campaignById(referralCampaignId);
		if (!campaign) throw new NotFoundError('campaign not found');

		return this.referralCampaignService.claimAmbassadorNft(
			campaign,
			currentUser.walletAddress,
			currentUser.id,
			claimSecret
		);
	}
}
