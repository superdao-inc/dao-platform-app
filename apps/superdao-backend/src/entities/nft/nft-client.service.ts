import { ethers } from 'ethers';
import toCamelCase from 'camelcase-keys';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import uniq from 'lodash/uniq';
import { AirdropParticipant, EnrichedNftOwner, EnrichedNftWithCollectionAddress } from 'src/entities/nft/nft.types';
import { CacheService, getUserNftsKey, getSingleNftKey } from 'src/services/cache';
import { mapMetadata } from 'src/entities/blockchain/mappers';
import { User } from 'src/entities/user/user.model';
import { toPublicMintInfo } from 'src/generators';
import { EnsResolver } from 'src/services/the-graph/ens/ensResolver';
import { CollectionsService } from '../collections/collections.service';

export interface IMintInfo {
	userAddress: string;
	tier: string;
}

@Injectable()
export class NftClientService {
	constructor(
		private readonly httpService: HttpService,
		private readonly cacheService: CacheService,
		private readonly collectionsService: CollectionsService
	) {}

	async getSingleNft(tokenId: string, daoAddress: string): Promise<EnrichedNftWithCollectionAddress> {
		const redisKeyFieldData = getSingleNftKey(daoAddress, tokenId);

		const data = await this.cacheService.hgetAndUpdate(redisKeyFieldData.key, redisKeyFieldData.field, async () => {
			const response = await this.httpService.axiosRef.get<EnrichedNftWithCollectionAddress>('/nfts/single-asset', {
				data: { tokenId, daoAddress }
			});
			return JSON.stringify(mapMetadata(response.data));
		});

		return toCamelCase(JSON.parse(data)) as EnrichedNftWithCollectionAddress;
	}

	async getNftsByUser(
		daoAddress: string,
		userAddress: string,
		_user?: User,
		forceReload = false
	): Promise<EnrichedNftOwner[]> {
		const redisKeyFieldData = getUserNftsKey(userAddress, daoAddress);

		const data = await this.cacheService.hgetAndUpdate(
			redisKeyFieldData.key,
			redisKeyFieldData.field,
			async () => {
				const response = await this.httpService.axiosRef.get<EnrichedNftOwner[]>('/nfts/by-user', {
					data: { userAddress, daoAddress }
				});
				return JSON.stringify(mapMetadata(response.data));
			},
			forceReload
		);

		return toCamelCase(JSON.parse(data)) as EnrichedNftOwner[];
	}

	async checkUserHasNft(daoAddress: string, userAddress: string, tiersToCheck: string[]) {
		const nfts = await this.getNftsByUser(daoAddress, userAddress, undefined, true);
		const userTiers = uniq(nfts.map((nft) => nft.tierId));

		return tiersToCheck.some((check) => userTiers.includes(check));
	}

	async checkTierHasFreeAmount(daoAddress: string, tierId: string) {
		const collection = await this.collectionsService.getCollection(daoAddress);
		const tier = collection.tiers.find((t) => t.id === tierId);

		if (!tier) throw Error('Tier not found');

		return tier.totalAmount < tier.maxAmount;
	}

	async claim(daoAddress: string, userAddress: string, tier: string): Promise<ethers.Transaction> {
		const response = await this.httpService.axiosRef.post<ethers.Transaction>('/nfts/claim', {
			daoAddress,
			toAddress: userAddress,
			tier
		});

		return toCamelCase(response.data);
	}

	async mint(daoAddress: string, mintInfo: IMintInfo): Promise<ethers.Transaction> {
		const response = await this.httpService.axiosRef.post<ethers.Transaction>('/nfts/mint', { daoAddress, mintInfo });

		return toCamelCase(response.data);
	}

	async batchMint(daoAddress: string, airdropInfo: IMintInfo[]): Promise<ethers.Transaction> {
		const response = await this.httpService.axiosRef.post<ethers.Transaction>('/nfts/batch-mint-v2', {
			daoAddress,
			airdropInfo
		});

		return toCamelCase(response.data);
	}

	/**
	 * @deprecated  бч-апи не ходим для airdrop, делаем напрямую в контракт
	 */
	async airdrop(daoAddress: string, whitelist: AirdropParticipant[]) {
		const airdropInfo = toPublicMintInfo(whitelist);
		const airdrop = await Promise.all(
			airdropInfo.map(async ({ userAddress, tier }) => ({
				userAddress: (await EnsResolver.resolve(userAddress)) || '',
				tier
			}))
		);
		return this.batchMint(daoAddress, airdrop);
	}

	async buyOpenSale(daoAddress: string, toAddress: string, tier: string): Promise<ethers.Transaction> {
		const response = await this.httpService.axiosRef.post<ethers.Transaction>('/nfts/buy/openSale', {
			daoAddress,
			toAddress,
			tier
		});

		return toCamelCase(response.data);
	}
}
