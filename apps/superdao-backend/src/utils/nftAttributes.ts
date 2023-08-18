import { NftAttribute, MultiTypeNftAttribute } from 'src/entities/nft/nft.types';
import { achievementSDTraits, MetadataAttributesSdTraits, TierTraitType } from 'src/types/metadata';

export const processAttributesBeforeFrontend = (attributes: NftAttribute[]): MultiTypeNftAttribute[] => {
	return attributes.map(({ value, ...attr }) => ({
		...attr,
		valueString: typeof value === 'string' ? value : undefined,
		valueNumber: typeof value === 'number' ? value : undefined
	}));
};

export const sortAttributesByPurpose = (attributes: MultiTypeNftAttribute[], isAdmin?: boolean) => {
	const achievements: MultiTypeNftAttribute[] = [];
	const benefits: MultiTypeNftAttribute[] = [];
	const customProperties: MultiTypeNftAttribute[] = [];

	attributes.forEach((attr) => {
		if (attr.sdTrait && achievementSDTraits.includes(attr.sdTrait as MetadataAttributesSdTraits)) {
			achievements.push(attr);
			return;
		}

		if (attr.sdTrait && attr.sdTrait === MetadataAttributesSdTraits.BENEFIT_SD_TRAIT) {
			benefits.push(attr);
			return;
		}

		if (isAdmin) {
			if (
				(attr.sdTrait && attr.sdTrait === MetadataAttributesSdTraits.TIER_SD_TRAIT) ||
				attr.traitType === TierTraitType
			) {
				return;
			}
		}

		customProperties.push(attr);
	});

	return { achievements, benefits, customProperties };
};
