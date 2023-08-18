import { ethers } from 'ethers';
import { TierParams } from 'src/entities/contract/types';
import { MultiTypeNftAttribute, TierArtworkTypeStrings } from 'src/entities/nft/nft.types';
import { ExtendedNftTier } from 'src/entities/nftAdmin/nftAdmin.types';
import {
	ERC721CustomAttribute,
	ExtendedERC721TokenMetadata,
	MetadataAttributesSdTraits,
	TierTraitType
} from 'src/types/metadata';

export const urlToIpfsHash = (url?: string) => {
	if (!url) return '';
	if (url.startsWith('ipfs://')) return url;

	const ipfsHash = url.split('/ipfs/').at(-1);
	if (!ipfsHash) return url;

	return `ipfs://${ipfsHash}`;
};

export const encodeTierData = (tier: ExtendedNftTier): TierParams => {
	const images = tier.artworks.map((artwork) => urlToIpfsHash(artwork.image || ''));
	const animation = tier.artworks.map((artwork) => urlToIpfsHash(artwork.animationUrl || ''));

	const mergedAttributes = mergeAttributes({
		achievements: tier.achievements,
		benefits: tier.benefits,
		customProperties: enrichAttrsWithRequired(tier.customProperties, tier?.tierName || '')
	});

	const attributes = processAttributesAfterFrontend(mergedAttributes);

	return {
		...tier,
		images,
		tierName: tier?.tierName ?? tier.id,
		transferUnlockDate: new Date(tier.transferUnlockDate),
		maxAmount: ethers.BigNumber.from(tier.maxAmount || '0'),
		isRandom: tier.tierArtworkType === TierArtworkTypeStrings.random,
		animation: animation.some((s) => !!s) ? animation : undefined,
		isDeactivated: Boolean(tier.isDeactivated),
		attributes
	};
};

export const enrichAttrsWithRequired = (attributes: MultiTypeNftAttribute[], name: string) => {
	if (!name) {
		return attributes;
	}

	const tierAttrIdx = attributes.findIndex((attr) => attr.sdTrait === MetadataAttributesSdTraits.TIER_SD_TRAIT);

	if (tierAttrIdx === -1) {
		return [
			{ traitType: TierTraitType, valueString: name, sdTrait: MetadataAttributesSdTraits.TIER_SD_TRAIT },
			...attributes
		];
	}

	return attributes;
};

export const getTokenMetadata = (fields: ExtendedERC721TokenMetadata) => {
	return {
		name: fields.name,
		description: fields.description,
		image: fields.image,
		animation_url: fields.animation_url,
		attributes: fields.attributes
	};
};

type MergeParams = {
	achievements: MultiTypeNftAttribute[];
	benefits: MultiTypeNftAttribute[];
	customProperties: MultiTypeNftAttribute[];
};

export const mergeAttributes = ({ achievements, benefits, customProperties }: MergeParams): MultiTypeNftAttribute[] => {
	return [...achievements, ...benefits, ...customProperties];
};

export const processAttributesAfterFrontend = (attributes: MultiTypeNftAttribute[]): ERC721CustomAttribute[] => {
	return attributes.map((attribute) => ({
		trait_type: attribute.traitType,
		display_type: attribute.displayType,
		sd_trait: attribute.sdTrait,
		value: attribute.valueString || attribute.valueNumber || ''
	}));
};
