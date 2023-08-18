// /* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import { NftAdminUpdateCollectionTxInput, TierArtworkTypeStrings } from 'src/types/types.generated';
import { DEFAULT_TIER_ID, MAX_ARTWORKS_LENGTH } from '../../../constants';

export const useWatchArtworkLengthToCalcTierType = (tierIdx: number) => {
	const { control, watch, setValue } = useFormContext<NftAdminUpdateCollectionTxInput>();
	const { id: tierId, artworks, maxAmount } = watch(`tiers.${tierIdx}`);

	const { defaultValues } = useFormState({ control });

	const isNewTier = useMemo(() => {
		if (tierId === DEFAULT_TIER_ID) {
			return true;
		}

		const tier = defaultValues?.tiers?.find((tier) => tier?.id === tierId);

		return !tier;
	}, [tierId, defaultValues?.tiers]);

	const calcTierType = useCallback(() => {
		if (isNewTier) {
			/**
			 * Если артворков нет или они пустые
			 */
			if (!artworks || artworks.length <= 1) {
				setValue(`tiers.${tierIdx}.tierArtworkType`, TierArtworkTypeStrings.One);
			}

			/**
			 * Если артворков больше 1, вычисляем тип
			 */
			if (artworks.length > 1) {
				setValue(`tiers.${tierIdx}.tierArtworkType`, TierArtworkTypeStrings.Random);

				/**
				 * Если количество артворков и maxAmount равны (больше 1)
				 * И если артворков меньше или равны 50 000 (ограничение контракта, для шафла)
				 */
				const isRandomShuffle =
					artworks.length === maxAmount && artworks.length <= MAX_ARTWORKS_LENGTH.isRandomShuffleMint;

				if (isRandomShuffle) {
					setValue(`tiers.${tierIdx}.isRandom`, false);
					setValue(`tiers.${tierIdx}.hasRandomShuffleMint`, true);
				}

				/**
				 * Если количество артворков меньше 5 000 (ограничени на контракте)
				 * maxAmount для рандома не играет роли, он может быть 0
				 */
				const isRandom = artworks.length <= MAX_ARTWORKS_LENGTH.isRandomMint;

				if (isRandom && !isRandomShuffle) {
					setValue(`tiers.${tierIdx}.isRandom`, true);
					setValue(`tiers.${tierIdx}.hasRandomShuffleMint`, false);
				}
			}
		}
	}, [artworks, isNewTier, maxAmount, setValue, tierIdx]);

	useEffect(() => {
		calcTierType();
	}, [calcTierType, artworks.length]);
};
