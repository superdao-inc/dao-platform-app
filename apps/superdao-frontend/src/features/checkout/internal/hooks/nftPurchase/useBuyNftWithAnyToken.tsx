import { useCallback } from 'react';
import { Chain, MATIC_TOKEN_ADDRESS } from '@sd/superdao-shared';
import { CustomError } from 'src/features/checkout/internal/namespace';
import { useBuyNftWithAllowance } from './useBuyNftWithAllowance';
import { UseBuyNftArgs } from './types';
import { useBuyNft } from './useBuyNft';
import { useChain } from 'src/hooks/useChain';

/**
 * Hook helper to buy nft either with matic or any other token that requires allowance.
 */
export const useBuyNftWithAnyToken = (args: UseBuyNftArgs) => {
	const { tokenAddress, onError } = args;

	const { switchChain } = useChain();

	const { buyNft } = useBuyNft(args);
	const buyNftWithAllowance = useBuyNftWithAllowance(args);

	const buy = useCallback(async () => {
		try {
			await switchChain(Chain.Polygon);

			if (tokenAddress === MATIC_TOKEN_ADDRESS) {
				buyNft();
			} else {
				buyNftWithAllowance();
			}
		} catch (error) {
			onError(error as CustomError);
		}
	}, [buyNft, buyNftWithAllowance, onError, switchChain, tokenAddress]);

	return buy;
};
