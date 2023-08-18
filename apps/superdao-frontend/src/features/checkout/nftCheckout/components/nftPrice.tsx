import { getTokenDecimalsBySymbol } from '@sd/superdao-shared';
import { getTokenIdBySymbol, FiatCoinMarketCapId } from '@sd/superdao-shared';

import { colors } from 'src/style';
import { Caption, Title3 } from 'src/components';
import { useExchangeQuery } from 'src/gql/exchange.generated';

import { calculatePriceWithDiscount } from '../../internal/helpers/calculatePriceWithDiscount';
import { getAmountFromDecimals } from '../../internal/helpers/getAmountFromDecimals';

type Price = {
	amount: string;
	currency: string;
};

type Props = {
	price: Price;
	discount: number;
	className?: string;
};

const convertPriceAndRound = (price: number, rate?: number) => {
	if (!rate) {
		return undefined;
	}

	return +(price * rate).toFixed(2);
};

export const NftPrice = (props: Props) => {
	const { price, discount, className = '' } = props;

	const { data } = useExchangeQuery({ quoteCurrenciesIds: [FiatCoinMarketCapId.USD] });

	const decimals = getTokenDecimalsBySymbol(price.currency);
	if (!decimals) return null;

	const priceWithDecimals = getAmountFromDecimals(+price.amount, decimals);

	let currentPrice = priceWithDecimals;
	if (discount) {
		currentPrice = calculatePriceWithDiscount(currentPrice, discount);
	}

	const cryptoCoinMarketCapId = getTokenIdBySymbol(price.currency);
	if (!cryptoCoinMarketCapId) return null;

	const rate = data?.exchange.find(({ baseCurrencyId }) => baseCurrencyId === cryptoCoinMarketCapId)?.rate;

	const fiatPrice = convertPriceAndRound(currentPrice, rate);

	return (
		<div className={className}>
			<div className="flex">
				<Title3 className="w-full text-right md:mr-2 md:text-left" color={colors.accentPrimary}>
					{currentPrice} {price.currency}
				</Title3>

				{!!discount && (
					<Title3 className="line-through" color={colors.foregroundTertiary}>
						{priceWithDecimals} {price.currency}
					</Title3>
				)}
			</div>

			{!!fiatPrice && <Caption color={colors.foregroundTertiary}>≈ {fiatPrice} USD</Caption>}
		</div>
	);
};
