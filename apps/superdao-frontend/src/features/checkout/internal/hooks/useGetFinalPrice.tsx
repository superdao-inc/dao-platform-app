import { getTokenDecimalsBySymbol } from '@sd/superdao-shared';
import { getAmountFromDecimals } from 'src/features/checkout/internal/helpers/getAmountFromDecimals';

/**
 * Calculates the final nft price based on the price value and the price token symbol.
 * @param price the price of nft from smart contract
 * @param symbol the price token symbol (currency)
 */
export const useGetFinalPrice = (price: string | undefined, symbol: string | undefined): number | null => {
	// Is used to protect from the case that Number('') == 0
	// eslint-disable-next-line prettier/prettier
	if (price === undefined ||
		price.toString().trim() === '' ||
		symbol === undefined ||
		symbol.toString().trim() === ''
	) 
		return null;

	const priceAsNumber = Number(price);
	if (isNaN(priceAsNumber)) return null;

	const priceTokenDecimals = getTokenDecimalsBySymbol(symbol);
	if (!priceTokenDecimals) return null;

	return getAmountFromDecimals(priceAsNumber, priceTokenDecimals);
};
