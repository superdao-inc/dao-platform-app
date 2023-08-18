import toCamelCase from 'camelcase-keys';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { Collection, NftAttribute } from 'src/entities/nft/nft.types';
import { CacheService, getCollectionsKey, getCollectionTierKey } from 'src/services/cache';
import { mapArtworks } from 'src/entities/blockchain/mappers';
import { ContractService } from 'src/entities/contract/contract.service';
import { User } from 'src/entities/user/user.model';
import { CompositeBlockchainService } from 'src/services/blockchain/blockchain.service';
import { assertNotFound } from 'src/exceptions/assert';
import { processAttributesBeforeFrontend, sortAttributesByPurpose } from 'src/utils/nftAttributes';
import { getTokenSymbolByAddress } from '@sd/superdao-shared';

import { TierConfigService } from '../tierConfig/tierConfig.service';
import { enrichTiersWithConfigs } from './utils';
import { CollectionTierInfoResponse } from '../blockchain/types';

interface INft {
	collectionAddress: string;
	tierId: string;
	tokenId: string;
}

@Injectable()
export class CollectionsService {
	private readonly logger = new Logger(CollectionsService.name);

	constructor(
		private readonly compositeBlockchainService: CompositeBlockchainService,
		private readonly cacheService: CacheService,
		private readonly httpService: HttpService,
		private readonly tierConfigService: TierConfigService,
		@Inject(forwardRef(() => ContractService)) private readonly contractService: ContractService
	) {}

	async getCollectionAddress(daoAddress: string) {
		return this.contractService.getCollectionAddress(daoAddress);
	}

	async getCollection(daoAddress: string, _user?: User): Promise<Collection> {
		const data = await this.cacheService.getAndUpdate(getCollectionsKey(daoAddress), async () => {
			try {
				const tokenSaleAddress = await this.contractService.getOpenSaleTokenAddress(daoAddress);
				const tokenSymbol = getTokenSymbolByAddress(tokenSaleAddress);

				let collection = (await this.compositeBlockchainService.getCollection(daoAddress)) as unknown as Collection;

				this.logger.log(`CollectionService.getCollection() response data: ${JSON.stringify(collection ?? null)}`);

				// please do not remove next implementation
				// yes, this method returns Collection, but on dev and stage ENVs
				// we have old and corrupted daos
				// this snippet is used to not to break group dao collections requests
				// if you have problems with dao/colelction/nft displaying - watch here maybe
				// for broken collections we have data by keys in redis
				// open-sale-token-address:(DAO_ADDRESS) (nil)
				// collections:(DAO_ADDRESS) "{\"tiers\":[]}"
				if (!collection) collection = {} as Collection;

				collection.tiers = collection.tiers?.length
					? await Promise.all(
							collection.tiers.map(async (tier) => {
								tier.currency = tokenSymbol ?? tier.currency ?? 'MATIC';
								const attributes = processAttributesBeforeFrontend(
									toCamelCase<NftAttribute[]>(tier.artworks[0]?.attributes || [])
								);
								const { achievements, benefits, customProperties } = sortAttributesByPurpose(attributes);
								tier.achievements = achievements;
								tier.benefits = benefits;
								tier.customProperties = customProperties;
								tier.totalPrice = await this.contractService.getTierSalesPrices(daoAddress, tier.id ?? tier.tierName);
								tier.salesActivity = await this.contractService.getTierSalesActivity(
									daoAddress,
									tier.id ?? tier.tierName
								);
								return tier;
							})
					  )
					: [];

				const collectionAddress = collection.collectionAddress;
				const tierConfigs = await this.tierConfigService.getTierConfigListByCollection(collectionAddress || '');

				collection.tiers = enrichTiersWithConfigs(collection.tiers, tierConfigs);

				return JSON.stringify(mapArtworks(collection));
			} catch (e: any) {
				this.logger.error(`CollectionService.getCollection() error: `, { message: e?.message });
				return JSON.stringify({ tiers: [] });
			}
		});

		return (data ? JSON.parse(data) : data) as Collection;
	}

	async getCollectionNFTs(daoAddress: string): Promise<INft[]> {
		const collectionRes = await this.httpService.axiosRef.get<Collection>('/collections', {
			data: { daoAddress }
		});

		const tiersInfo: CollectionTierInfoResponse[] = [];

		for (let tier of collectionRes.data.tiers) {
			const tierInfoRes = await this.getCollectionInfoByTier(daoAddress, tier.id);
			tiersInfo.push(tierInfoRes.value);
		}

		const nfts = tiersInfo.reduce((nftsAcc, tierInfo) => {
			const tierNfts = Object.entries(tierInfo.owners).reduce((tierNftsAcc, [, ownerNFTs]) => {
				const ownerNfts: INft[] = ownerNFTs.map((ownerNFT) => ({
					collectionAddress: collectionRes.data.collectionAddress,
					tierId: tierInfo.id,
					tokenId: ownerNFT.tokenId
				}));

				return [...tierNftsAcc, ...ownerNfts];
			}, [] as INft[]);

			return [...nftsAcc, ...tierNfts];
		}, [] as INft[]);

		return nfts;
	}

	async getCollectionByCollectionAddress(collectionAddress: string): Promise<Collection> {
		const collectionRes = await this.httpService.axiosRef.get<Collection>('/collections', {
			data: { collectionAddress }
		});

		return collectionRes.data;
	}

	async getCollectionInfoByTier(
		daoAddress: string,
		tier: string,
		_user?: User
	): Promise<{ value: CollectionTierInfoResponse }> {
		const redisKeyFieldData = getCollectionTierKey(daoAddress, tier);

		const resp = await this.cacheService.hgetAndUpdate(redisKeyFieldData.key, redisKeyFieldData.field, async () => {
			const tokenSaleAddress = await this.contractService.getOpenSaleTokenAddress(daoAddress);
			const tokenSymbol = getTokenSymbolByAddress(tokenSaleAddress) || '';

			const response = await this.compositeBlockchainService.getCollectionTierWithOwners(daoAddress, tier);
			assertNotFound(response.value, 'Collection tier not found');

			response.value.currency = tokenSymbol || response.value.currency;

			response.value.totalPrice = await this.contractService.getTierSalesPrices(daoAddress, tier);

			return JSON.stringify(mapArtworks(response));
		});

		return toCamelCase(JSON.parse(resp)) as { value: CollectionTierInfoResponse };
	}
}
