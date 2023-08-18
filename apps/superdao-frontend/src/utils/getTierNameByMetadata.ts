import { TIER_TRAIT_TYPE } from 'src/constants';
import { NftMetadata } from 'src/types/types.generated';

// TODO: use tierName from blockain-api
/**
 * Sometimes we get nft attribute traitType with type === null
 * For this case we try to get tier name from first attr if we don't have valid tier trait type
 */
export const getTierNameByMetadata = (metadata: NftMetadata | null) => {
	if (!metadata?.attributes?.length) return undefined;

	const isSingle = metadata.attributes.length === 1;
	const singleTraitType = (isSingle && metadata.attributes[0]) || undefined;
	const singleTraitTypeIsEmpty = singleTraitType?.traitType;

	const validTierName = metadata.attributes.find(
		({ traitType }) => traitType?.toUpperCase() === TIER_TRAIT_TYPE
	)?.value;
	const probableTierName = !validTierName && singleTraitTypeIsEmpty && metadata.attributes[0].value;

	return validTierName || probableTierName;
};
