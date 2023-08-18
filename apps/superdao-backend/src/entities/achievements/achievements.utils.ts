import { ethers } from 'ethers';
import toCamelCase from 'camelcase-keys';
import { GraphTierFragment } from 'src/gql/codegen/sdk';
import {
	MAX_AMOUNT,
	TIER_RANDOM_MINT,
	TIER_RANDOM_SHUFFLE_MINT,
	TOTAL_AMOUNT,
	DEACTIVATED,
	IS_TRANSFERABLE,
	TRANSFER_UNLOCKS_AT_HOURS
} from '@sd/superdao-shared';

import { TierArtworkTypeStrings, NftMetadata } from 'src/entities/nft/nft.types';
import { CollectionTierAttributes } from 'src/entities/achievements/achievements.types';
import { infuraService } from 'src/blockchain/services/infura';
import { TierHelperData, TierMeta } from 'src/entities/contract/types';
import { getIpfsUrlByHash } from 'src/entities/contract/utils';
import { MetadataFetcher } from 'src/entities/contract/metadataFetcher';

export const toLowerCaseWithDashes = (text: string) => text.trim().replace(/ /g, '-').toLowerCase();

//TODO move to shared NFT codebase, was taken from erc721Helper.service.ts
const getTierArtworkTypeOne = async (tier: TierHelperData, metadataFetcher: MetadataFetcher) => {
	const artworks: NftMetadata[] = [];

	const metadata = await metadataFetcher.getTierMetadata(tier.id);
	const { animation_url, attributes: metaAttributes = [], image: metaImage, description = '' } = metadata;

	const image = typeof metaImage === 'string' ? getIpfsUrlByHash(metaImage) : '';
	const animationUrl = typeof animation_url === 'string' ? getIpfsUrlByHash(animation_url) : '';
	const attributes = metaAttributes.map((attr) => toCamelCase(attr));

	artworks.push({
		id: '0',
		image,
		animationUrl,
		attributes,
		description: description ?? ''
	});
	const artworksTotalLength = 1;

	return { artworks, artworksTotalLength, description, metadata };
};

//TODO move to shared NFT codebase, was taken from erc721Helper.service.ts
const getTierArtworkTypeRandom = async (tier: TierHelperData, metadataFetcher: MetadataFetcher) => {
	const artworks: NftMetadata[] = [];
	let artworksTotalLength = 0;
	let description = '';

	const baseURI = metadataFetcher.getBaseURI();
	const cid = baseURI.replace('ipfs://', '');
	const dagCid = tier.tierArtworkType === TierArtworkTypeStrings.random ? `${cid}/${tier.id}` : cid;
	const tierMetadataDagInfo = await infuraService.getDagInfo(dagCid);

	const files = await Promise.all(
		new Array(tierMetadataDagInfo.Links.length).fill(0).map(async (_, i) => {
			return metadataFetcher.getTierFile(tier.id, i);
		})
	);

	for (const metadata of files) {
		const { animation_url, attributes: metaAttributes = [], image: metaImage, description: metaDescription } = metadata;
		description = metaDescription ?? '';

		const image = typeof metaImage === 'string' ? getIpfsUrlByHash(metaImage) : '';
		const animationUrl = typeof animation_url === 'string' ? getIpfsUrlByHash(animation_url) : '';
		const attributes = metaAttributes.map((attr) => toCamelCase(attr));

		artworks.push({
			id: artworks.length.toString(),
			attributes,
			description,
			image,
			animationUrl
		});
		artworksTotalLength++;
	}

	return { artworks, artworksTotalLength, description };
};

//TODO move to shared NFT codebase, was taken from erc721Helper.service.ts
export const getTierMetadata = async (tier: TierHelperData, metadataFetcher: MetadataFetcher): Promise<TierMeta> => {
	const artworks: NftMetadata[] = [];
	let artworksTotalLength = 0;
	let description = '';

	switch (tier.tierArtworkType) {
		case TierArtworkTypeStrings.one: {
			const {
				artworks: tierArtworks,
				description: tierDescription,
				artworksTotalLength: tierArtworksTotalLength
			} = await getTierArtworkTypeOne(tier, metadataFetcher);

			artworks.push(...tierArtworks);
			description = tierDescription ?? '';
			artworksTotalLength = tierArtworksTotalLength;

			break;
		}

		case TierArtworkTypeStrings.random: {
			const {
				artworks: tierArtworks,
				description: tierDescription = '',
				artworksTotalLength: tierArtworksTotalLength
			} = await getTierArtworkTypeRandom(tier, metadataFetcher);

			artworks.push(...tierArtworks);
			description = tierDescription;
			artworksTotalLength = tierArtworksTotalLength;

			break;
		}

		default:
			throw Error('Unknown tier type');
	}

	const firstSuitableMetadata = artworks[0]; // TODO think about this

	return {
		artworks,
		artworksTotalLength,
		description,
		metadata: firstSuitableMetadata
	};
};

//TODO move to shared NFT codebase, was taken from erc721Helper.service.ts
export const extractTierAttributes = (tier: GraphTierFragment): CollectionTierAttributes | null => {
	const { attributes } = tier;

	if (!attributes) return null;

	return attributes.reduce(
		(tierProps: CollectionTierAttributes, attribute) => {
			try {
				if (attribute.key === TOTAL_AMOUNT) {
					return {
						...tierProps,
						totalAmount: ethers.BigNumber.from(attribute.value).toNumber()
					};
				}

				if (attribute.key === MAX_AMOUNT) {
					return {
						...tierProps,
						maxAmount: ethers.BigNumber.from(attribute.value).toNumber()
					};
				}

				if (attribute.key === TIER_RANDOM_MINT) {
					return {
						...tierProps,
						isRandom: attribute.value !== ethers.constants.HashZero
					};
				}

				if (attribute.key === TIER_RANDOM_SHUFFLE_MINT) {
					return {
						...tierProps,
						hasRandomShuffleMint: attribute.value !== ethers.constants.HashZero
					};
				}

				if (attribute.key === DEACTIVATED) {
					return {
						...tierProps,
						isDeactivated: attribute.value !== ethers.constants.HashZero
					};
				}

				if (attribute.key === IS_TRANSFERABLE) {
					return {
						...tierProps,
						isTransferable: attribute.value !== ethers.constants.HashZero
					};
				}

				if (attribute.key === TRANSFER_UNLOCKS_AT_HOURS) {
					return {
						...tierProps,
						transferUnlockDate: ethers.BigNumber.from(attribute.value).toNumber()
					};
				}

				return tierProps;
			} catch (error) {
				return tierProps;
			}
		},
		{
			maxAmount: undefined,
			totalAmount: undefined,
			isRandom: undefined,
			hasRandomShuffleMint: undefined,
			isTransferable: undefined,
			transferUnlockDate: undefined,
			isDeactivated: undefined
		} as CollectionTierAttributes
	);
};

export const determineTierArtworkType = (tier: GraphTierFragment): TierArtworkTypeStrings => {
	const { attributes } = tier;

	if (attributes) {
		const isRandomArtworkType = attributes.some((attribute) => {
			const isRandomMintAttribute = attribute.key === TIER_RANDOM_MINT;
			const isRandomMintShuffleAttribute = attribute.key === TIER_RANDOM_SHUFFLE_MINT;
			const isZeroHashValue = attribute.value === ethers.constants.HashZero;

			return (isRandomMintAttribute || isRandomMintShuffleAttribute) && !isZeroHashValue;
		});

		if (isRandomArtworkType) return TierArtworkTypeStrings.random;
	}

	return TierArtworkTypeStrings.one;
};

// this function assumes that the url looks like 'ipfs://NATIVE_ID'
export const extractNativeIdFromIpfsUrl = (ipfsUrl: string): string => {
	return ipfsUrl.split('://').at(-1) as string;
};
