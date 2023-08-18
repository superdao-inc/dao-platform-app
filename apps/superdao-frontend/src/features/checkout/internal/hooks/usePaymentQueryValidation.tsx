import { useRouter } from 'next/router';

import { withRedirect } from '../helpers';
import { PaymentIsNotValidModal } from '../modals';
import { IBaseValidation } from '../namespace';

import { getChain } from '../helpers/getChain';
import { useCheckoutNavigationContext } from 'src/features/checkout/internal/context/checkoutNavigationContext';
import { Chain, Token, tokensMap } from '@sd/superdao-shared/';

const getIsTokenAvailable = (tokenId: number, chainId: Chain, availableTokens: Record<Chain, Token[]>) => {
	if (!(chainId in availableTokens)) return false;

	const isTokenIncludedInChainTokens: boolean = availableTokens[chainId].some((token) => token.id === tokenId);
	return isTokenIncludedInChainTokens;
};

export const usePaymentQueryValidation = (): IBaseValidation | null => {
	const { query } = useRouter();
	const { tokenId, chain } = query;
	const { navigation } = useCheckoutNavigationContext();
	const toPaymentSelection = () => navigation.toPaymentSelection();

	const tokenIdAsNumber = typeof tokenId === 'string' ? +tokenId : 0;
	const chainId = getChain(chain);

	let isTokenAvailable = false;
	if (chainId) isTokenAvailable = getIsTokenAvailable(tokenIdAsNumber, chainId, tokensMap);

	if (!chainId || !isTokenAvailable) {
		return {
			isValid: false,
			ErrorModal: withRedirect(PaymentIsNotValidModal, toPaymentSelection)
		};
	}

	return {
		isValid: true,
		ErrorModal: withRedirect(PaymentIsNotValidModal, toPaymentSelection)
	};
};
