import { TotalPrice } from 'src/types/types.generated';

type Maybe<T> = T | null | undefined;

export const getSalePrice = (
	isOpenSaleAvailable: boolean,
	isWhitelistAvailable: boolean,
	prices: Maybe<TotalPrice> | null
) => {
	if (!prices) return '0';

	if (isWhitelistAvailable) return prices.whitelistSale;
	if (isOpenSaleAvailable) return prices.openSale;

	return prices.whitelistSale || '0';
};
