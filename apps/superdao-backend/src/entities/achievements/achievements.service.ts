import { Injectable, Logger } from '@nestjs/common';
import { utils as etherUtils } from 'ethers';
import defaultTo from 'lodash/defaultTo';
import groupBy from 'lodash/groupBy';
import keyBy from 'lodash/keyBy';
import orderBy from 'lodash/orderBy';
import { NotFoundError } from 'src/exceptions';

import { AchievementsFetcher } from 'src/entities/achievements/achievements.fetcher';
import {
	AchievementNft,
	AchievementsUserProgress,
	AchievementTier,
	AchievementTierWithOwners,
	LeaderboardMember,
	RoadmapLevel
} from 'src/entities/achievements/achievements.types';
import { UpdateRoadmapInput } from 'src/entities/achievements/dto/updateRoadmap.dto';
import { DaoService } from 'src/entities/dao/dao.service';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import { UserService } from 'src/entities/user/user.service';
import { MetadataAttributesSdTraits, MetadataTierTypeAttributeValues } from 'src/types/metadata';
import { isNotEmpty } from '@sd/superdao-shared';

@Injectable()
export class AchievementsService {
	private readonly logger = new Logger(AchievementsService.name);

	constructor(
		private readonly daoService: DaoService,
		private readonly userService: UserService,
		private readonly achievementsFetcher: AchievementsFetcher,
		private readonly daoMembershipService: DaoMembershipService
	) {}

	async getAchievementTierOwners(tierNfts: AchievementNft[]) {
		const tierNftOwnersWallets = tierNfts.map((nft) => nft.ownerOf);
		const tierNftTokenIdByOwnerWalletMap = new Map(tierNfts.map((nft) => [nft.ownerOf, nft.tokenId]));

		const usersByWallets = await this.userService.findManyByWalletAddresses(tierNftOwnersWallets);
		const usersByWalletsMap = new Map(usersByWallets?.map((user) => [user.walletAddress.toLowerCase(), user]));

		const transformedOwners: AchievementTierWithOwners['owners'] = tierNftOwnersWallets.map((walletAddress) => {
			const user = usersByWalletsMap.get(walletAddress);
			const tokenId = tierNftTokenIdByOwnerWalletMap.get(walletAddress);

			const checksumedWalletAddress = etherUtils.getAddress(walletAddress);

			return {
				walletAddress: checksumedWalletAddress,
				displayName: defaultTo(user?.displayName, null),
				email: defaultTo(user?.email, null),
				ens: defaultTo(user?.ens, null),
				avatar: defaultTo(user?.avatar, null),
				tokenId: defaultTo(tokenId, ''),
				name: defaultTo(user?.displayName, walletAddress),
				id: defaultTo(user?.id, null)
			};
		});

		return transformedOwners;
	}

	async getAchievementTier(daoAddress: string, tierId: string): Promise<AchievementTierWithOwners> {
		const achievementTier = await this.achievementsFetcher.fetchAchievementTier(daoAddress, tierId);

		const transformedOwners = await this.getAchievementTierOwners(achievementTier.nfts);

		const achievementTierWithOwner: AchievementTierWithOwners = {
			...achievementTier,
			owners: transformedOwners
		};

		return achievementTierWithOwner;
	}

	async getAchievementTiers(daoAddress: string): Promise<AchievementTierWithOwners[]> {
		const achievementTiers = await this.achievementsFetcher.fetchAchievementTiers(daoAddress);

		return Promise.all(
			achievementTiers.map(async (achievementTier) => {
				const { nfts: tierNfts } = achievementTier;

				const transformedOwners = await this.getAchievementTierOwners(tierNfts);

				const achievementTiersWithOwners: AchievementTierWithOwners = {
					...achievementTier,
					owners: transformedOwners
				};

				return achievementTiersWithOwners;
			})
		);
	}

	async getUserAchievementTiers(daoAddress: string, ownerAddress: string): Promise<AchievementTierWithOwners[]> {
		const achievementTiers = await this.getAchievementTiers(daoAddress);

		return achievementTiers.filter((achievement) => {
			return achievement.owners.some((owner) => owner.walletAddress === ownerAddress);
		});
	}

	async getAchievementsUserProgress(daoId: string, userAddress: string): Promise<AchievementsUserProgress | null> {
		const dao = await this.daoService.getById(daoId);
		if (!dao) return null;

		const { contractAddress, achievementsRoadmapLevels } = dao;

		if (achievementsRoadmapLevels.length <= 1) {
			const defaultRoadmapLevels = [
				{
					xpNeeded: 0,
					bonuses: []
				},
				{
					xpNeeded: 50,
					bonuses: []
				}
			];
			achievementsRoadmapLevels.push(...defaultRoadmapLevels);
		}

		if (!contractAddress) return null;

		const achievementTiers = await this.achievementsFetcher.fetchAchievementTiers(contractAddress);
		const achievementTiersByTierId = keyBy(achievementTiers, (achievementTier) => achievementTier.id);
		const nfts = (await this.achievementsFetcher.fetchUserAchievementsNfts(contractAddress, userAddress)) || [];

		const nftsParsed = nfts
			.map((nft) => {
				const tierNativeId = nft.tier?.nativeID!;

				const tier: AchievementTier | undefined = achievementTiersByTierId[tierNativeId];

				if (!tier) return;

				return this.achievementsFetcher.transformGraphNftToAchievementNft(nft, tier.metadata);
			})
			.filter((nftParsed) => isNotEmpty(nftParsed)) as AchievementNft[];

		const achievementNfts = this.getAchievementNfts(nftsParsed);
		const achievementXP = achievementNfts.reduce(
			(acc, achievement) => acc + this.getAchievementXPAttribute(achievement),
			0
		);

		const level = this.getMemberLevel(achievementXP, achievementsRoadmapLevels);
		const levelDetails = achievementsRoadmapLevels[level - 1] || null;

		return {
			xp: achievementXP,
			level,
			levelDetails,
			levelsRoadmap: achievementsRoadmapLevels
		};
	}

	async getLeaderboard(daoId: string, search: string) {
		const dao = await this.daoService.getById(daoId);
		if (!dao) return null;
		const { contractAddress, achievementsRoadmapLevels } = dao;
		if (!contractAddress) return null;

		const daoMembers = await this.daoMembershipService.getMembers({
			daoId,
			offset: 0,
			limit: 1000,
			search,
			roles: null as any
		});

		const achievementTiers = await this.achievementsFetcher.fetchAchievementTiers(contractAddress);

		const achievementTiersByTierId = keyBy(achievementTiers, (achievementTier) => achievementTier.id);
		const membersNfts = (await this.achievementsFetcher.fetchCollectionNfts(contractAddress)) || [];

		const achievementsNftsParsed = membersNfts
			.map((memberNft) => {
				const tierNativeId = memberNft.tier?.nativeID!;

				const tier = achievementTiersByTierId[tierNativeId];

				if (!tier) return;

				return this.achievementsFetcher.transformGraphNftToAchievementNft(memberNft, tier.metadata);
			})
			.filter((memberNfts) => isNotEmpty(memberNfts)) as AchievementNft[];

		const membersToAchievementNfts = groupBy(achievementsNftsParsed, ({ ownerOf }) => ownerOf);

		const leaderboardMembers: LeaderboardMember[] = daoMembers.items.map((daoMember) => {
			const memberNfts: AchievementNft[] | undefined = membersToAchievementNfts[daoMember.user.walletAddress]!!;

			// const membershipNfts = memberNfts.filter((memberNft) =>
			// 	memberNft.metadata?.attributes.find(
			// 		(attribute) =>
			// 			attribute.sdTrait === MetadataAttributesSdTraits.TIER_TYPE_SD_TRAIT &&
			// 			attribute.value === MetadataTierTypeAttributeValues.membership // attribute.traitType === TierTraitType //TODO Memberhip sdTrait by default  traitType = 'Tier'
			// 	)
			// );

			// const team = membershipNfts.find((memberNft) => memberNft.tierName) || 'Core team';
			const role = daoMember.role;

			const achievementNfts = this.getAchievementNfts(memberNfts || []);
			const achievementXp = achievementNfts.reduce(
				(acc, achievement) => acc + this.getAchievementXPAttribute(achievement),
				0
			);

			const leaderboardMember: LeaderboardMember = {
				role,
				xp: achievementXp,
				achievementNFTs: achievementNfts,
				achievementNFTsCount: achievementNfts.length,
				level: this.getMemberLevel(achievementXp, achievementsRoadmapLevels),
				roadmapLevelsCount: achievementsRoadmapLevels.length,
				user: daoMember.user
			};

			return leaderboardMember;
		});

		return orderBy(leaderboardMembers, ({ xp }) => xp, 'desc');
	}

	private getMemberLevel(exp: number, levels: RoadmapLevel[]): number {
		return levels.reduce((userLevel, level, idx) => {
			if (exp >= level.xpNeeded) {
				return idx + 1;
			}
			return userLevel;
		}, 1);
	}

	private getAchievementNfts(nfts: AchievementNft[]) {
		return nfts.filter((nft) =>
			nft.metadata?.attributes.some(
				(attribute) =>
					attribute.sdTrait === MetadataAttributesSdTraits.TIER_TYPE_SD_TRAIT &&
					attribute.value === MetadataTierTypeAttributeValues.achievement
			)
		);
	}

	// private getTiers(nfts: AchievementNft[]) {
	// 	return nfts.flatMap(
	// 		(nft) =>
	// 			nft.metadata?.attributes
	// 				.filter(
	// 					(attribute) =>
	// 						attribute.sdTrait === MetadataAttributesSdTraits.TIER_TYPE_SD_TRAIT &&
	// 						attribute.value === MetadataTierTypeAttributeValues.achievement // I think that we must use achievement istead of membership
	// 				)
	// 				.map((att) => String(att.value)) || []
	// 	);
	// }

	private getAchievementXPAttribute(achievementNft: AchievementNft) {
		return (
			Number(
				achievementNft.metadata?.attributes.find(
					(attribute) => attribute.sdTrait === MetadataAttributesSdTraits.ACHIEVEMENT_XP_SD_TRAIT
				)?.value
			) || 0
		);
	}

	private validateRoadmapLevels(levels: RoadmapLevel[]) {
		if (!levels.length) throw new Error('Roadmap should have at least one level');

		// bonuses should have unique titles
		const bonuses = levels.flatMap((level) => level.bonuses);
		const uniqueBonuses = new Set(bonuses.map((a) => a.title));
		if (uniqueBonuses.size !== bonuses.length) {
			this.logger.error(`Invalid roadmap: ${JSON.stringify(levels)}`);
			throw new Error('Bonuses should have unique names');
		}

		// xpNeeded should be increasing
		const xpNeeded = levels.map((level) => level.xpNeeded);
		const isIncreasing = xpNeeded.every((value, index, array) => index === 0 || value > array[index - 1]);
		if (!isIncreasing) {
			this.logger.error(`Invalid roadmap: ${JSON.stringify(levels)}`);
			throw new Error('Needed XP should increase with each level');
		}
	}

	async getRoadmapLevels(daoId: string) {
		const dao = await this.daoService.getById(daoId);
		if (!dao) throw new NotFoundError();

		return dao.achievementsRoadmapLevels;
	}

	async updateRoadmap(updateSchemaData: UpdateRoadmapInput) {
		const { daoId, levels } = updateSchemaData;
		const dao = await this.daoService.getById(daoId);
		if (!dao) throw new NotFoundError();

		this.validateRoadmapLevels(levels);

		dao.achievementsRoadmapLevels = levels;
		await dao.save();

		return dao.achievementsRoadmapLevels;
	}
}
