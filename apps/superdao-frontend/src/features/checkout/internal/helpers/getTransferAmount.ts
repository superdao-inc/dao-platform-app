import { adjustPriceToStockChanges } from './adjustPriceToStockChanges';
import { getAmountInDecimals } from './getAmountInDecimals';

export const getTransferAmount = (price: number, decimals: number) => {
	const adjustedPrice = adjustPriceToStockChanges(price);
	return Math.ceil(getAmountInDecimals(adjustedPrice, decimals));
};
