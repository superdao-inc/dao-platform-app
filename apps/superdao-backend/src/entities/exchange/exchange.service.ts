import { Injectable } from '@nestjs/common';
import { coinMarketCapClient } from 'src/services/coinMarketCap/coinMarketCap.api';
import { CoinMarketCapService } from 'src/services/coinMarketCap/coinMarketCap.service';
import { ExchangePair } from './dto/exchange.dto';

/**
 * CoinMarketCap updates its market pair data every 1 minute.
 */
const TIME_TO_REFETCH_EXCHANGE_PAIR = 60 * 1000; // 1 minute

@Injectable()
export class ExchangeService {
	constructor(private readonly coinMarketCapService: CoinMarketCapService) {}

	async getCurrenciesExchangePairs(baseCurrenciesIds: number[], quoteCurrenciesIds: number[]) {
		const lastUpdatedAt = await this.coinMarketCapService.getExchangeCurrenciesPairsUpdatedAt(
			quoteCurrenciesIds,
			baseCurrenciesIds
		);

		let exchangePairs: ExchangePair[] = [];

		if (!lastUpdatedAt || Math.abs(new Date().getTime() - lastUpdatedAt.getTime()) > TIME_TO_REFETCH_EXCHANGE_PAIR) {
			const { data } = await coinMarketCapClient.getQuotes({
				baseCurrenciesIds,
				quoteCurrenciesIds
			});

			baseCurrenciesIds.forEach((baseCurrencyId) => {
				for (const quoteCurrencyId of quoteCurrenciesIds) {
					const rate = data[`${baseCurrencyId}`].quote[`${quoteCurrencyId}`].price;
					exchangePairs.push({
						baseCurrencyId,
						quoteCurrencyId,
						rate
					});
				}
			});

			await this.coinMarketCapService.setExchangeCurrenciesPairs(quoteCurrenciesIds, baseCurrenciesIds, exchangePairs);
		} else {
			exchangePairs =
				(await this.coinMarketCapService.getExchangeCurrenciesPairs(quoteCurrenciesIds, baseCurrenciesIds)) || [];
		}

		return exchangePairs;
	}
}
