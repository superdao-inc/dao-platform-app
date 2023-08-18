import isEmpty from 'lodash/isEmpty';
import { MIN_VISIBLE_USD_AMOUNT } from 'src/constants';
import { FiatCoinMarketCapId, getTokenIdBySymbol } from '@sd/superdao-shared';
import { SubHeading } from 'src/components';
import { useExchangeQuery } from 'src/gql/exchange.generated';
import { colors } from 'src/style';
import { Erc721Token, Token, WalletTransactionDirection, WalletTransactionPart } from 'src/types/types.generated';
import { formatUnitsValue } from 'src/utils/formattes';
import { shrinkValue } from '@sd/superdao-shared';
import { getAmountFromDecimals } from 'src/features/checkout/internal/helpers/getAmountFromDecimals';

type Props = {
	part: WalletTransactionPart;
};

const isERC721Token = (token: Token): token is Erc721Token => token.type === 'ERC-721';

export const TransferPart = ({ part }: Props) => {
	const { token, value, direction } = part;
	const sign = direction === WalletTransactionDirection.In ? '+' : '-';
	const color = direction === WalletTransactionDirection.In ? colors.accentPositive : colors.accentNegative;

	const { data } = useExchangeQuery({ quoteCurrenciesIds: [FiatCoinMarketCapId.USD] }, { enabled: !isEmpty(value) });
	const cryptoCoinMarketCapId = getTokenIdBySymbol(token.symbol);
	const rate = data?.exchange.find(({ baseCurrencyId }) => baseCurrencyId === cryptoCoinMarketCapId)?.rate;
	const fiatPrice = rate && (getAmountFromDecimals(+value, token.decimals || 18) * rate).toFixed(2);

	if (isERC721Token(token)) {
		return (
			<div className="flex items-center">
				<SubHeading color={color}>{`${sign} NFT ${shrinkValue(token.name, 6, 4, 20)}`}</SubHeading>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center">
				<SubHeading color={color}>
					{`${sign} ${formatUnitsValue(value, token.decimals || 18)}
					${token.symbol}`}
				</SubHeading>
			</div>

			<SubHeading className="text-right" color={colors.foregroundSecondary}>
				{fiatPrice && +fiatPrice < MIN_VISIBLE_USD_AMOUNT ? `< $${MIN_VISIBLE_USD_AMOUNT}` : `$${fiatPrice}`}
			</SubHeading>
		</div>
	);
};
