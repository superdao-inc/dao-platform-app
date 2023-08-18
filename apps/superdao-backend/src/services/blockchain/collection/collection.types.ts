import { TotalPrice } from 'src/entities/nft/nft.types';
import { ERC721CustomAttribute } from 'src/types/metadata';
import { ATTRIBUTE_KEY_MAP } from '@sd/superdao-shared';

export type Artwork = {
	id: string;
	image?: string;
	imageOriginal?: string;
	animationUrl?: string;
	attributes: ERC721CustomAttribute[];
};

export type TierArtworkResponse = {
	artworks: Artwork[];
	artworksTotalLength: number;
	description: string;
};

export type AttributeStructure = {
	key?: string | null;
	value?: string | null;
};

export type MappedAttributes = {
	[key in ATTRIBUTE_KEY_MAP]: string | number | boolean | null;
};

export type TierOwners = {
	[key: string]: Array<{
		name: string;
		tokenId: string;
	}>;
};

// TODO: removed hardcoded currency after the graph is updated:
export type CURRENCY_TYPE = 'MATIC' | string;

export type Tier = {
	id: string;
	name: string;
	currency: CURRENCY_TYPE;
	description: string;
	collectionName?: string | null;
	collectionAddress: string;
	tierArtworkType: 'random' | 'one';
	totalPrice: TotalPrice;
} & MappedAttributes &
	TierArtworkResponse;

// FIXME: remove owners from here -> must be fetched separately
export type TierWithOwners = Tier & { owners: TierOwners };

export type TierResponse = { value: Tier };
export type TierWithOwnersResponse = { value: TierWithOwners };

export type CollectionResponse = {
	collectionAddress: string;
	name: string;
	description: string;
	tiers: Tier[];
};
