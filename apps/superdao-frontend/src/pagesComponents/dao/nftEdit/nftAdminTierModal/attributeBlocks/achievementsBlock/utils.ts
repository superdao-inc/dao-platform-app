import { MultiTypeNftAttributeInput } from 'src/types/types.generated';
import { MetadataAttributesSdTraits } from '../../../types';
import { TIER_TYPE_ACHIEVEMENT, TIER_TYPE_MEMBERSHIP } from './constants';

export const getDefaultTierTypeAttr = (
	value: typeof TIER_TYPE_MEMBERSHIP | typeof TIER_TYPE_ACHIEVEMENT = TIER_TYPE_MEMBERSHIP
) => ({
	traitType: 'Tier type',
	sdTrait: MetadataAttributesSdTraits.TIER_TYPE_SD_TRAIT,
	valueString: value
});

export const getDefaultXPAttr = (amountXP: number = 0) => ({
	traitType: 'XP',
	displayType: 'boost_number',
	sdTrait: MetadataAttributesSdTraits.ACHIEVEMENT_XP_SD_TRAIT,
	valueNumber: amountXP
});

export const getDefaultLabelAttr = (newLabel: string = '') => ({
	traitType: 'Achievement label',
	sdTrait: MetadataAttributesSdTraits.ACHIEVEMENT_LABEL_SD_TRAIT,
	valueString: newLabel
});

export const orderAttrs = (attrs: MultiTypeNftAttributeInput[]) => {
	let tierTypeAttr: MultiTypeNftAttributeInput | null = null;
	let xpAttr: MultiTypeNftAttributeInput | null = null;
	let elseAttrs: MultiTypeNftAttributeInput[] = [];

	let orderedAttrs: MultiTypeNftAttributeInput[] = [];

	attrs.forEach((attr) => {
		if (attr.sdTrait === MetadataAttributesSdTraits.TIER_TYPE_SD_TRAIT) {
			tierTypeAttr = attr;
			return;
		}

		if (attr.sdTrait === MetadataAttributesSdTraits.ACHIEVEMENT_XP_SD_TRAIT) {
			xpAttr = attr;
			return;
		}

		elseAttrs.push(attr);
	});

	if (tierTypeAttr) {
		orderedAttrs.push(tierTypeAttr);
	} else {
		orderedAttrs.push(getDefaultTierTypeAttr());
		return orderedAttrs;
	}

	if (orderedAttrs[0].valueString === TIER_TYPE_ACHIEVEMENT) {
		if (xpAttr) {
			orderedAttrs.push(xpAttr);
		} else {
			orderedAttrs.push(getDefaultXPAttr());
		}

		if (elseAttrs.length > 0) {
			orderedAttrs.push(...elseAttrs);
		} else {
			orderedAttrs.push(getDefaultLabelAttr());
		}
	}

	return orderedAttrs;
};
