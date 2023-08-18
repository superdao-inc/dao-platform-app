import { ExtendedNftTier, NftMetadata, NftTierConfig } from 'src/types/types.generated';
import { NftFields } from 'src/validators/nft';

export enum AdminPanelSections {
	collection = 'collection',
	publicSale = 'publicSale',
	privateSale = 'privateSale'
}

export type ExtendedNftMetadata = NftMetadata & { imageName?: string | null; animationUrlName?: string | null };

export type CollectionForm = NftFields & { tiers: ExtendedNftTier[]; tierConfigs: NftTierConfig[] };

export enum MetadataAttributesSdTraits { //TODO get this Enum from src/types/types.generated
	ACHIEVEMENT_LABEL_SD_TRAIT = 'ACHIEVEMENT_LABEL_SD_TRAIT',
	ACHIEVEMENT_XP_SD_TRAIT = 'ACHIEVEMENT_XP_SD_TRAIT',
	BENEFIT_SD_TRAIT = 'BENEFIT_SD_TRAIT',
	TIER_SD_TRAIT = 'TIER_SD_TRAIT',
	TIER_TYPE_SD_TRAIT = 'TIER_TYPE_SD_TRAIT'
}
