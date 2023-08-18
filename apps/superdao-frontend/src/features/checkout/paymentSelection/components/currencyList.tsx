import { Chain } from '@sd/superdao-shared';

import { EthereumCurrencyCell } from './currencyCell/ethereumCurrencyCell';
import { PolygonCurrencyCell } from './currencyCell/polygonCurrencyCell';
import { EnrichedToken } from 'src/features/checkout/paymentSelection/namespace';

type Props = {
	chain: Chain;
	tokens: EnrichedToken[] | undefined;
	selectedTokenId: number | undefined;
	/**
	 * The symbol of the token (currency) the nft price is stored in.
	 */
	priceTokenSymbol: string;
	userBalanceInNativeToken: number | undefined;
	handleChooseCurrency: (token: EnrichedToken) => () => void;
};

export const CurrencyList = (props: Props) => {
	const { chain, tokens, selectedTokenId, priceTokenSymbol, handleChooseCurrency, userBalanceInNativeToken } = props;

	const CurrencyCell = chain === Chain.Ethereum ? EthereumCurrencyCell : PolygonCurrencyCell;

	return (
		<div className="bg-backgroundSecondary rounded-lg px-2 py-2 transition-all">
			{tokens?.map((token) => (
				<CurrencyCell
					key={token.symbol}
					token={token}
					priceTokenSymbol={priceTokenSymbol}
					onClick={handleChooseCurrency(token)}
					isSelected={selectedTokenId === token.id}
					userBalanceInNativeToken={userBalanceInNativeToken}
				/>
			))}
		</div>
	);
};
