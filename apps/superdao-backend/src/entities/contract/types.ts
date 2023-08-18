import { ethers } from 'ethers';
import { NftMetadata } from 'src/entities/nft/nft.types';
import { ExtendedNftTier } from 'src/entities/nftAdmin/nftAdmin.types';
import { TIER_ATTRIBUTES } from '@sd/superdao-shared';
import { ERC721CustomAttribute } from 'src/types/metadata';

export type TierParams = {
	id: string;
	tierName: string;
	description?: string | null;
	isTransferable: boolean;
	isDeactivated: boolean;
	transferUnlockDate: Date;
	maxAmount: ethers.BigNumber;
	totalAmount?: number;
	isRandom: boolean;
	hasRandomShuffleMint: boolean;
	images: string[];
	animation?: string[];
	attributes: ERC721CustomAttribute[];
};

export type BuyNftOptions = {
	tier: string;
	userWalletAddress: string;
	tokenAddress: string;
};

export type BuyWhitelistNftOptions = {
	tier: string;
	proof: string[];
};

export type RemovingTier = Pick<TierParams, 'id' | 'totalAmount' | 'isDeactivated'>;

export type TierId = string;

export type TierWithAttributes = Record<keyof typeof TIER_ATTRIBUTES, number | string | boolean>;
export type TiersWithAttributes = Record<TierId, TierWithAttributes>;

export type TierMeta = {
	artworks: NftMetadata[];
	artworksTotalLength: number;
	description: string;
	metadata?: NftMetadata;
};

export type TierAttribute = { name: keyof typeof TIER_ATTRIBUTES; type: 'number' | 'string' | 'boolean' };

export type TierHelperData = Pick<ExtendedNftTier, 'id' | 'tierArtworkType' | 'maxAmount' | 'hasRandomShuffleMint'>;
