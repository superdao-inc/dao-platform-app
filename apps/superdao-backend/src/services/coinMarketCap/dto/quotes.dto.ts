import { BaseResponse } from 'src/services/coinMarketCap/dto/common.dto';

export type GetQuotesRequest = {
	/**
	 * The base currency (what to convert).
	 * Cryptocurrencies ids are taken according to CoinMarketCap.
	 * Can't be empty.
	 * @example [1027, 825] - base currency is ETH (id=1027) and Tether (id=825)
	 *
	 * If you have a lot of tokens, pass them to this array rather than
	 * to "quoteCurrenciesIds" to spend less CoinMarketCap API credits.
	 */
	baseCurrenciesIds: number[];

	/**
	 * Currencies (fiat or crypto) to convert cryptocurrencies to.
	 * Can't be empty.
	 *
	 * @example [1, 2781] - base currency will be converted to BTC (id=1) and USD (id=2781)
	 */
	quoteCurrenciesIds: number[];
};

export type GetQuotesResponse = BaseResponse & {
	data: {
		/**
		 * Cryptocurrency id that is converted.
		 */
		[baseCurrencyId: string]: {
			/**
			 * The same as cryptocurrencyId.
			 */
			id: number;
			symbol: string;
			quote: {
				/**
				 * Currency id the conversion is made to.
				 */
				[quoteCurrencyId: string]: {
					price: number;
				};
			};
		};
	};
};
