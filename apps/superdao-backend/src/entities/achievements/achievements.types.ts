import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Min, MinLength } from 'class-validator';
import { ArtworkType } from 'src/entities/blockchain/types';
import {
	NftArtwork,
	// NftBase,
	NftMetadata,
	NftTier,
	// NftOwner as NftWithOwner,
	TierArtworkTypeStrings,
	Owners as NftOwner,
	// EnrichedNft,
	NftBase
} from 'src/entities/nft/nft.types';
import { User } from 'src/entities/user/user.model';
import { DaoMemberRole } from '../daoMembership/daoMembership.types';

@ObjectType('RoadmapbonusObject')
@InputType('RoadmapbonusInput')
export class RoadmapBonus {
	@Field()
	@MinLength(1)
	title: string;

	@Field()
	@MinLength(1)
	description: string;

	@Field()
	@MinLength(1)
	image: string;
}

@ObjectType('RoadmapLevelObject')
@InputType('RoadmapLevelInput')
export class RoadmapLevel {
	@Field()
	@Min(1)
	xpNeeded: number;

	@Field(() => [RoadmapBonus])
	bonuses: RoadmapBonus[];
}

@ObjectType()
export class AchievementTier extends NftTier {
	@Field(() => NftMetadata, { nullable: true })
	metadata: NftMetadata;

	@Field(() => String)
	collectionAddress: string;

	@Field(() => String, { nullable: true })
	collectionName: string;

	@Field(() => [AchievementNft])
	nfts: AchievementNft[];
}

@ObjectType()
export class LeaderboardMember {
	@Field(() => User)
	user: User;

	@Field(() => Number)
	level: number;

	@Field(() => Number)
	xp: number;

	@Field(() => [AchievementNft])
	achievementNFTs: AchievementNft[];

	@Field(() => Number)
	achievementNFTsCount: number;

	@Field(() => DaoMemberRole)
	role: DaoMemberRole;

	@Field(() => Number)
	roadmapLevelsCount: number;
}

@ObjectType()
export class AchievementNft extends NftBase {
	// @Field(() => String, { nullable: true })
	// collectionAddress?: string;

	@Field(() => String)
	tierId: string;

	@Field(() => String)
	tierName: string;

	@Field(() => String)
	ownerOf: string;

	@Field(() => NftMetadata, { nullable: true })
	metadata: NftMetadata | null;
}

// TODO maybe CollectionTierInfo
@ObjectType()
export class AchievementTierWithOwners extends AchievementTier {
	@Field(() => [NftOwner])
	owners: NftOwner[];
}
@ObjectType()
export class AchievementDetails {
	@Field(() => String)
	id: string;

	@Field(() => String, { nullable: true })
	tierName: string | null;

	@Field(() => String, { nullable: true })
	description: string | null;

	@Field(() => [NftArtwork])
	artworks: ArtworkType[];

	@Field(() => Number, { nullable: true })
	maxAmount: number;

	@Field(() => TierArtworkTypeStrings)
	tierArtworkType: TierArtworkTypeStrings;

	@Field(() => Number, { nullable: true })
	totalAmount: number;

	@Field(() => String)
	collectionAddress: string;

	@Field(() => String, { nullable: true })
	collectionName: string | null;

	@Field(() => String, { nullable: true })
	openseaUrl: string | null;

	@Field(() => String, { nullable: false })
	polygonscanUrl: string;

	@Field(() => NftMetadata, { nullable: true })
	metadata: NftMetadata;
}

@ObjectType()
export class AchievementsUserProgress {
	@Field(() => Number)
	xp: number;

	@Field(() => Number)
	level: number;

	@Field(() => RoadmapLevel, { nullable: true })
	levelDetails: RoadmapLevel;

	@Field(() => [RoadmapLevel])
	levelsRoadmap: RoadmapLevel[];
}

export type RawAchievementDetails = {
	id: string;
	tierName: string | null;
	nativeID: string;
	description: string | null;
	artworks: ArtworkType[];
	maxAmount: number;
	tierArtworkType: TierArtworkTypeStrings;
	totalAmount: number;
	collectionAddress: string;
	collectionName: string | null;
	openseaUrl: string | null;
	polygonscanUrl: string;
	metadata: NftMetadata;
	nfts: TierNft[];
};

export type CollectionTierAttributes = {
	maxAmount?: number;
	totalAmount?: number;
	isRandom?: boolean;
	hasRandomShuffleMint?: boolean;
	isTransferable?: boolean;
	transferUnlockDate?: number;
	isDeactivated?: boolean;
};

export type Full<T> = NonNullable<{
	[P in keyof T]-?: NonNullable<T[P]>;
}>;

export type Defined<T> = Full<NonNullable<T>>;

export type TierNft = {
	id: string;
	artworkID: number;
	tokenID: any;
	transferredAt?: any | null;
	tier: { nativeID: string };
	owner: { id: string };
	collection: { id: string };
};

export type DaoCollectionTier = {
	id: string;
	name: string;
	nativeID: string;
	attributes?: Array<{
		id: string;
		key?: string | null;
		value?: string | null;
		propertyKey?: string | null;
		propertyValue?: string | null;
	}> | null;
	Nfts: Array<TierNft>;
};

export type DefinedDao = {
	collection: {
		id: string;
		isNative: boolean;
		name?: string | null;
		symbol?: string | null;
		url: string;
		openseaOwner?: any | null;
		nfts: Array<{
			id: string;
			tokenID: any;
			artworkID?: number | null;
			transferredAt?: any | null;
			tier: {
				id: string;
				name: string;
				nativeID: string;
				attributes?: Array<{
					id: string;
					key?: string | null;
					value?: string | null;
					propertyKey?: string | null;
					propertyValue?: string | null;
				}> | null;
				Nfts: Array<{
					id: string;
					tokenID: any;
					transferredAt?: any | null;
					tier: { nativeID: string };
					owner: { id: string };
					collection: { id: string };
				}>;
			};
			owner: { id: string };
			collection: { id: string };
		}>;
		tiers: Array<DaoCollectionTier>;
	};
};
