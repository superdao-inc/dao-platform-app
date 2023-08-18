import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

const TTL = 24 * 60 * 60; // in seconds
const VALUE_LOG_LENGTH = 500;

const wrapLogValue = (value: string | null) => {
	if (value && value.length > VALUE_LOG_LENGTH) {
		const postfix = '<...>';
		return `${value.substring(0, VALUE_LOG_LENGTH)}${postfix}`;
	}

	return value;
};

@Injectable()
export class CacheService {
	private readonly logger = new Logger(CacheService.name);

	constructor(@InjectRedis() private readonly redis: Redis) {}

	// for one-stage keys (collections:*daoAddress*)
	async get(key: string): Promise<string | null> {
		const value = await this.redis.get(key);
		this.logger.log(`Get cached value by key: ${key}\nValue: ${wrapLogValue(value)}`);
		return value;
	}

	async set(key: string, value: string, customTTL?: number): Promise<void> {
		await this.redis.set(key, value, 'EX', customTTL ? customTTL : TTL);
		this.logger.log(`Set cached value with key: ${key}\nCustomTTL: ${customTTL}`);
	}

	// use as hdelAll
	async del(key: string): Promise<number | void> {
		const value = await this.redis.del(key);
		this.logger.log(`Delete cached value by key: ${key}`);
		return value;
	}

	// if you need delAll - use redis hash functionality with hget, hset, hdel and so on...

	async getAndUpdate(
		key: string,
		dataManipulationFunc: () => Promise<string>,
		customTTL?: number,
		forceReload = false
	): Promise<string> {
		const cachedData = this.get(key)
			.then((data) => {
				if (data) return data;
				if (!forceReload) throw new Error(`[CacheService] Cached data not found for key: ${key}`);
			})
			.catch((error: Error) => {
				this.logger.warn(error.message);
				throw error;
			});

		const updatedData = dataManipulationFunc()
			.then(async (data: string) => {
				await this.set(key, data, customTTL);
				return data;
			})
			.catch((error) => {
				this.logger.error('Error while trying to cache ', {
					key,
					error
				});
			});

		if (forceReload) return updatedData as Promise<string>;

		return Promise.any([cachedData, updatedData]) as Promise<string>;
	}

	// for non-one-stage keys (artworks:*daoAddress*:*collectionAddress*)
	// hash works MUCH faster than keys * patterns
	// https://www.notion.so/superdao/TechTalks-34d6b9fe6b0548a4a6e55cda838e8006#25a3b0dd5f6548b6877270565259668f
	async hget(key: string, field: string): Promise<string | null> {
		const value = await this.redis.hget(key, field);
		this.logger.log(`Hget cached value by key: ${key}, field: ${field}\nValue: ${wrapLogValue(value)}`);
		return value;
	}

	async hset(key: string, field: string, value: string): Promise<void> {
		await this.redis.hset(key, field, value);
		this.logger.log(`Hset cached value with key: ${key}, field: ${field}`);
	}

	async hdel(key: string, field: string): Promise<number | void> {
		const value = await this.redis.hdel(key, field);
		this.logger.log(`Hdel cached value by key: ${key}, field: ${field}`);
		return value;
	}

	async hgetAndUpdate(
		key: string,
		field: string,
		dataManipulationFunc: () => Promise<string>,
		forceReload = false
	): Promise<string> {
		const cachedData = this.hget(key, field)
			.then((data) => {
				if (data) return data;
				if (!forceReload) throw new Error(`[CacheService] Cached data not found for key: ${key}`);
			})
			.catch((error: Error) => {
				this.logger.warn(error.message);
				throw error;
			});

		const updatedData = dataManipulationFunc()
			.then(async (data: string) => {
				await this.hset(key, field, data);
				return data;
			})
			.catch((error) => {
				this.logger.error('Error while trying to cache ', {
					error
				});
			});

		if (forceReload) return updatedData as Promise<string>;

		return Promise.any([cachedData, updatedData]) as Promise<string>;
	}
}
