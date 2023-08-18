import { ComponentProps, useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';

import { useSwapRoutesQuery } from '../../../internal/hooks/useSwapRoutesQuery';
import { getAmountInDecimals } from '../../../internal/helpers/getAmountInDecimals';
import { CurrencyInfo } from '../currencyInfo';
import { CurrencyCellView, TokenDescription, getIsEnoughMoney } from './currencyCell';
import { EnrichedToken } from 'src/features/checkout/paymentSelection/namespace';
import { toast } from 'src/components';

import { Chain, MATIC_TOKEN_ADDRESS_FOR_VIA, NATIVE_TOKEN_SYMBOLS, roundCryptoCurrency } from '@sd/superdao-shared';
import { DEFAULT_GAS_FOR_SWAP } from 'src/constants';
import { TokenImage } from '../tokenImage';

type Props = {
	token: EnrichedToken;
	userBalanceInNativeToken: number | undefined;
	isSelected: boolean;
	onClick: () => void;
};

export const EthereumCurrencyCell = (props: Props) => {
	const { token, userBalanceInNativeToken = 0, isSelected, onClick } = props;
	const { t } = useTranslation();
	const [isEnough, setIsEnough] = useState(false);

	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [gasAmount, setGasAmount] = useState<number | null>(null); // В ETH

	const { data, isLoading } = useSwapRoutesQuery(
		{
			fromChainId: Chain.Ethereum,
			fromTokenAddress: token.tokenAddress,
			fromAmount: getAmountInDecimals(token.price, token.decimals),
			toChainId: Chain.Polygon,
			toTokenAddress: MATIC_TOKEN_ADDRESS_FOR_VIA
		},
		{
			onError: (e: any) => {
				toast.error(e.toString());
			}
		}
	);

	useEffect(() => {
		if (!isLoading) {
			const firstRoute = data?.routes?.[0];

			if (!firstRoute) {
				setErrorMessage(t('pages.checkout.choose.routeNotFound'));
				setGasAmount(null);
				return;
			}

			const gasInGwei = firstRoute?.fee?.gas ?? DEFAULT_GAS_FOR_SWAP;
			const gasInEth = gasInGwei / 10 ** 9;

			setErrorMessage(null);
			setGasAmount(roundCryptoCurrency(gasInEth));
			setIsEnough(getIsEnoughMoney(token.userBalance, token.price, gasInEth, userBalanceInNativeToken, false));
		}
	}, [t, token.price, token.userBalance, data, isLoading, userBalanceInNativeToken]);

	const gasInfo: ComponentProps<typeof CurrencyInfo>['gasInfo'] = {
		isLoading,
		errorMessage,
		gas: {
			amount: gasAmount,
			tokenSymbol: NATIVE_TOKEN_SYMBOLS[Chain.Ethereum]
		}
	};

	const isDisabled = !isEnough || gasAmount === null;

	const handleClick = () => {
		if (!isDisabled && !isSelected) onClick();
	};

	return (
		<CurrencyCellView
			onClick={handleClick}
			isDisabled={isDisabled}
			isSelected={isSelected}
			size="md"
			before={<TokenImage isSelected={isSelected} src={token.logo!} alt={token.name} />}
			label={token.name}
			description={<TokenDescription balance={token.userBalance} isEnough={!isDisabled} />}
			after={<CurrencyInfo count={token.price} symbol={token.symbol} isEqualSymbolShown gasInfo={gasInfo} />}
		/>
	);
};
