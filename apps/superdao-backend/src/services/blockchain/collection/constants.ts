import { TierAttribute } from 'src/entities/contract/types';
import { TIER_TYPES } from '@sd/superdao-shared';

export const tierAttributes: TierAttribute[] = Object.keys(TIER_TYPES).map((key) => {
	return {
		name: key,
		type: TIER_TYPES[key as keyof typeof TIER_TYPES]
	};
});
