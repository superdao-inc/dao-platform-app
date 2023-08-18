import { useMemo } from 'react';
import { useExchangeQuery } from 'src/gql/exchange.generated';
import { formatEthersPriceWithSymbol, cutNumber } from 'src/utils/formattes';
import { getSalePrice } from 'src/utils/getSalePrice';
import { getTokenDecimalsBySymbol, FiatCoinMarketCapId, getTokenIdBySymbol, CurrencySymbol } from '@sd/superdao-shared';

type Props = {
	isPrivateSaleAndUserVerified: boolean;
	isOpenSaleActive: boolean;
	currency?: string;
	totalPrice: { openSale: string; whitelistSale: string } | null;
};

export const useTierPrice = ({ isPrivateSaleAndUserVerified, currency, isOpenSaleActive, totalPrice }: Props) => {
	const tokenSymbol = useMemo(
		() => (isPrivateSaleAndUserVerified ? CurrencySymbol.MATIC : currency ?? CurrencySymbol.MATIC),
		[isPrivateSaleAndUserVerified, currency]
	);

	const unformattedPrice = useMemo(
		() => getSalePrice(isOpenSaleActive, isPrivateSaleAndUserVerified, totalPrice) || '0',
		[isOpenSaleActive, isPrivateSaleAndUserVerified, totalPrice]
	);
	const decimals = useMemo(() => getTokenDecimalsBySymbol(tokenSymbol), [tokenSymbol]);
	const tokenAmount = useMemo(
		() => formatEthersPriceWithSymbol(unformattedPrice, decimals),
		[decimals, unformattedPrice]
	);

	const rates = useExchangeQuery(
		{ quoteCurrenciesIds: [FiatCoinMarketCapId.USD] },
		{ refetchInterval: 60 * 1000 } // 1 minute
	).data?.exchange;

	const priceTokenId = useMemo(() => {
		if (!tokenSymbol) return;

		return getTokenIdBySymbol(tokenSymbol);
	}, [tokenSymbol]);

	const fiatAmount = useMemo(() => {
		if (!tokenAmount || !rates || !priceTokenId) {
			return 0;
		}
		const { rate } = rates.find(({ baseCurrencyId }) => baseCurrencyId === priceTokenId)!;
		const fiatAmount = Number(tokenAmount) * rate;

		return cutNumber(`${fiatAmount}`, 2);
	}, [tokenAmount, priceTokenId, rates]);

	return {
		fiatAmount,
		tokenAmount,
		tokenSymbol,
		fiatSymbol: '$'
	};
};
