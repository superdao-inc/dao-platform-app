import { ComponentProps } from 'react';

import { NATIVE_TOKEN_SYMBOLS, Chain } from '@sd/superdao-shared';
import { CurrencyInfo } from '../currencyInfo';
import { getIsEnoughMoney, CurrencyCellView, TokenDescription } from './currencyCell';
import { EnrichedToken } from 'src/features/checkout/paymentSelection/namespace';
import { TokenImage } from '../tokenImage';

type Props = {
	token: EnrichedToken;
	/**
	 * The symbol of the token (currency) the nft price is stored in.
	 */
	priceTokenSymbol: string;
	userBalanceInNativeToken: number | undefined;
	isSelected: boolean;
	onClick: () => void;
};

const GAS_AMOUNT = 0.2;

export const PolygonCurrencyCell = (props: Props) => {
	const { token, priceTokenSymbol, userBalanceInNativeToken = 0, isSelected, onClick } = props;

	const isMatic = token.symbol === NATIVE_TOKEN_SYMBOLS[Chain.Polygon];
	const isEnough = getIsEnoughMoney(token.userBalance, token.price, GAS_AMOUNT, userBalanceInNativeToken, isMatic);

	const gasInfo: ComponentProps<typeof CurrencyInfo>['gasInfo'] = {
		isLoading: false,
		errorMessage: null,
		gas: {
			amount: GAS_AMOUNT,
			tokenSymbol: NATIVE_TOKEN_SYMBOLS[Chain.Polygon]
		}
	};

	const isDisabled = !isEnough;

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
			after={
				<CurrencyInfo
					count={token.price}
					symbol={token.symbol}
					isEqualSymbolShown={token.symbol !== priceTokenSymbol}
					gasInfo={gasInfo}
				/>
			}
		/>
	);
};
