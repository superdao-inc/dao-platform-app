import React from 'react';
import {
	OneFilledIcon,
	OneIcon,
	RandomFilledIcon,
	RandomIcon,
	RevealFilledIcon,
	RevealIcon,
	UniqueFilledIcon,
	UniqueIcon
} from 'src/components/assets/icons/nft';
import { SvgProps } from 'src/components/assets/svg';
import { TierArtworkTypeStrings } from 'src/types/types.generated';

export const UNLIMITED_MAX_AMOUNT_VALUE = 1_000_000_000;

type NftTypes = Record<string, { icon: React.FC<SvgProps>; title: string; description: string }>;

const getNftType = (isOutlinedIcon: boolean): NftTypes => ({
	one: {
		icon: isOutlinedIcon ? OneIcon : OneFilledIcon,
		title: 'Single artwork',
		description: 'You will receive same artwork as others'
	},
	reveal: {
		icon: isOutlinedIcon ? RevealIcon : RevealFilledIcon,
		title: 'Reveal',
		description: 'You will see a modified artwork after buying this NFT'
	},
	unique: {
		icon: isOutlinedIcon ? UniqueIcon : UniqueFilledIcon,
		title: 'Unique',
		description: 'After buy, you will receive the chosen artwork'
	},
	random: {
		icon: isOutlinedIcon ? RandomIcon : RandomFilledIcon,
		title: 'Random',
		description: 'After buy, you will receive one of the artworks randomly'
	}
});

export const getNftTypeData = (tierArtworkType?: TierArtworkTypeStrings, isOutlinedIcon = true) => {
	const tierType = tierArtworkType ? getNftType(isOutlinedIcon)?.[tierArtworkType] : undefined;
	const TierArtworkTypeIcon = tierType?.icon ?? null;

	return {
		...tierType,
		TierArtworkTypeIcon
	};
};
