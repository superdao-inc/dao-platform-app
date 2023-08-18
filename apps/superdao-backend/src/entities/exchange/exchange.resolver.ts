import { Args, Query, Resolver } from '@nestjs/graphql';
import {
	ExchangeCurrenciesRequestArgs,
	ExchangePair,
	ExchangeRequestArgs
} from 'src/entities/exchange/dto/exchange.dto';
import { coinMarketCapClient } from 'src/services/coinMarketCap/coinMarketCap.api';
import { CoinMarketCapService } from 'src/services/coinMarketCap';
import { allTokensIdsWithUsdId } from '@sd/superdao-shared';
import { ExchangeService } from './exchange.service';

/**
 * CoinMarketCap updates its market pair data every 1 minute.
 */
const TIME_TO_REFETCH_EXCHANGE_PAIR = 60 * 1000; // 1 minute

@Resolver()
export class ExchangeResolver {
	constructor(
		private readonly exchangeService: ExchangeService,
		private readonly coinMarketCapService: CoinMarketCapService
	) {}

	@Query((_returns) => [ExchangePair])
	public async exchange(@Args() exchangeRequest: ExchangeRequestArgs): Promise<ExchangePair[]> {
		const { quoteCurrenciesIds } = exchangeRequest;

		const lastUpdatedAt = await this.coinMarketCapService.getExchangePairsUpdatedAt(quoteCurrenciesIds);

		let exchangePairs: ExchangePair[] = [];

		if (!lastUpdatedAt || Math.abs(new Date().getTime() - lastUpdatedAt.getTime()) > TIME_TO_REFETCH_EXCHANGE_PAIR) {
			const { data } = await coinMarketCapClient.getQuotes({
				baseCurrenciesIds: allTokensIdsWithUsdId,
				quoteCurrenciesIds
			});

			allTokensIdsWithUsdId.forEach((baseCurrencyId) => {
				for (const quoteCurrencyId of quoteCurrenciesIds) {
					const rate = data[`${baseCurrencyId}`].quote[`${quoteCurrencyId}`].price;
					exchangePairs.push({
						baseCurrencyId,
						quoteCurrencyId,
						rate
					});
				}
			});

			await this.coinMarketCapService.setExchangePairs(quoteCurrenciesIds, exchangePairs);
		} else {
			exchangePairs = (await this.coinMarketCapService.getExchangePairs(quoteCurrenciesIds)) || [];
		}

		return exchangePairs;
	}

	/**
	 * Is not in use right now, created for token transferring with VIA in checkout feature
	 * TODO: delete if definitely not needed
	 */
	@Query((_returns) => [ExchangePair])
	public async exchangeCurrencies(@Args() exchangeRequest: ExchangeCurrenciesRequestArgs): Promise<ExchangePair[]> {
		const { baseCurrenciesIds, quoteCurrenciesIds } = exchangeRequest;

		const exchangePairs = await this.exchangeService.getCurrenciesExchangePairs(baseCurrenciesIds, quoteCurrenciesIds);

		return exchangePairs;
	}
}
