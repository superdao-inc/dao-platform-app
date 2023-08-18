import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import {
	getRedisExchangeCurrenciesPairsKey,
	getRedisExchangeCurrenciesPairsLastUpdatedKey,
	getRedisExchangePairsKey,
	getRedisExchangePairsLastUpdatedKey
} from 'src/services/coinMarketCap/constants';
import { ExchangePair } from 'src/entities/exchange/dto/exchange.dto';

@Injectable()
export class CoinMarketCapService {
	constructor(@InjectRedis() private readonly redis: Redis) {}

	public async getExchangePairsUpdatedAt(quoteCurrenciesIds: number[]) {
		const time = await this.redis.get(getRedisExchangePairsLastUpdatedKey(quoteCurrenciesIds));

		if (time === null) return null;
		return new Date(time);
	}

	public async setExchangePairs(quoteCurrenciesIds: number[], tokens: ExchangePair[]) {
		await this.redis.set(getRedisExchangePairsKey(quoteCurrenciesIds), JSON.stringify(tokens));
		await this.redis.set(getRedisExchangePairsLastUpdatedKey(quoteCurrenciesIds), new Date().toUTCString());
	}

	public async getExchangePairs(quoteCurrenciesIds: number[]) {
		const rawTokens = await this.redis.get(getRedisExchangePairsKey(quoteCurrenciesIds));

		if (rawTokens === null) return null;
		return JSON.parse(rawTokens) as ExchangePair[];
	}

	public async getExchangeCurrenciesPairsUpdatedAt(quoteCurrenciesIds: number[], baseCurrenciesIds: number[]) {
		const time = await this.redis.get(
			getRedisExchangeCurrenciesPairsLastUpdatedKey(quoteCurrenciesIds, baseCurrenciesIds)
		);

		if (time === null) return null;
		return new Date(time);
	}

	public async setExchangeCurrenciesPairs(
		quoteCurrenciesIds: number[],
		baseCurrenciesIds: number[],
		tokens: ExchangePair[]
	) {
		await this.redis.set(
			getRedisExchangeCurrenciesPairsKey(quoteCurrenciesIds, baseCurrenciesIds),
			JSON.stringify(tokens)
		);
		await this.redis.set(
			getRedisExchangeCurrenciesPairsLastUpdatedKey(quoteCurrenciesIds, baseCurrenciesIds),
			new Date().toUTCString()
		);
	}

	public async getExchangeCurrenciesPairs(quoteCurrenciesIds: number[], baseCurrenciesIds: number[]) {
		const rawTokens = await this.redis.get(getRedisExchangeCurrenciesPairsKey(quoteCurrenciesIds, baseCurrenciesIds));

		if (rawTokens === null) return null;
		return JSON.parse(rawTokens) as ExchangePair[];
	}
}
