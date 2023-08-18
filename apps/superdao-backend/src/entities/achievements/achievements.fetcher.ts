import { Injectable, Logger } from '@nestjs/common';
import toCamelCase from 'camelcase-keys';

import { GraphClient } from 'src/services/the-graph/graph-polygon/graph.client';
import { GetGraphDaoCollectionQuery, GraphNftFragment, GraphTierNftFragment } from 'src/gql/codegen/sdk';

import { NftMetadata, TierArtworkTypeStrings } from 'src/entities/nft/nft.types';
import { processAttributesBeforeFrontend, sortAttributesByPurpose } from 'src/utils/nftAttributes';

import { mapMetadata } from 'src/entities/blockchain/mappers';
import { DefinedDao, AchievementTier, AchievementNft } from 'src/entities/achievements/achievements.types';
import {
	extractNativeIdFromIpfsUrl,
	extractTierAttributes,
	getTierMetadata
} from 'src/entities/achievements/achievements.utils';

import { TierHelperData } from 'src/entities/contract/types';
import { MetadataFetcher } from 'src/entities/contract/metadataFetcher';
import { MetadataAttributesSdTraits, MetadataTierTypeAttributeValues } from 'src/types/metadata';

import { NotFoundError } from 'src/exceptions';

@Injectable()
export class AchievementsFetcher {
	private readonly logger = new Logger(AchievementsFetcher.name);

	constructor(private readonly graphClient: GraphClient) {}

	private validateDao(dao: GetGraphDaoCollectionQuery['dao']): dao is DefinedDao {
		if (!dao?.collection) {
			this.logger.error(`[Get Achievement Details] Can't get collection info by dao address`);
			throw new NotFoundError("Can't get collection info by dao address");
		}

		const { collection: nftCollection } = dao;
		if (!nftCollection.url) {
			this.logger.error(`[Get Achievement Details] Requested DAO has no baseURI for NFT collection`, dao);
			throw new NotFoundError('Requested DAO has no baseURI for NFT collection');
		}

		if (!nftCollection.tiers) {
			this.logger.error(`[Get Achievement Details] Requested DAO NFT collection has no tiers`, nftCollection);
			throw new NotFoundError('Requested DAO NFT collection has no tiers');
		}

		if (!nftCollection.url) {
			this.logger.error(`[Get Achievement Details] Requested DAO NFT collection has no IPFS url`, nftCollection);
			throw new NotFoundError('Requested DAO NFT collection has no IPFS url');
		}

		const collectionNativeId = extractNativeIdFromIpfsUrl(nftCollection.url);
		if (!collectionNativeId) {
			this.logger.error(
				`[Get Achievement Details] Requested DAO NFT collection contains unsupported IPFS url`,
				nftCollection
			);
			throw new NotFoundError('Requested DAO NFT collection contains unsupported IPFS url');
		}

		return true;
	}

	private isAchievementTier(metadata: NftMetadata) {
		return (
			metadata.attributes.find((attr) => attr.sdTrait === MetadataAttributesSdTraits.TIER_TYPE_SD_TRAIT)?.value ===
			MetadataTierTypeAttributeValues.achievement
		);
	}

	//TODO fill all AchievementNft fields
	transformGraphNftToAchievementNft(
		graphNft: GraphNftFragment | GraphTierNftFragment,
		metadata: NftMetadata
	): AchievementNft {
		return {
			tokenId: graphNft.id,
			tokenAddress: graphNft.collection.id,
			tierId: graphNft.tier?.nativeID || '',
			tierName: '',
			contractType: 'ERC721',
			ownerOf: graphNft.owner.id,
			tokenUri: '',
			syncedAt: '0001-01-01T00:00:00Z',
			amount: '1',
			name: '',
			symbol: '',
			metadata: mapMetadata(metadata)
		};
	}

	async fetchCollectionNfts(daoAddress: string) {
		const daoCollectionResponse = await this.graphClient.daoCollectionNfts(daoAddress.toLowerCase());

		const { dao } = daoCollectionResponse || {};

		if (!dao) {
			throw new NotFoundError('[Get Achievement Details]: dao is not found');
		}

		return dao.collection?.nfts;
	}

	async fetchUserAchievementsNfts(daoAddress: string, userAddress: string) {
		const daoCollectionResponse = await this.graphClient.daoCollectionOwnerNfts(
			daoAddress.toLowerCase(),
			userAddress.toLowerCase()
		);

		const { dao } = daoCollectionResponse || {};

		if (!dao) {
			throw new NotFoundError('[Get Achievement Details]: dao is not found');
		}

		return dao.collection?.nfts;
	}

	async fetchAchievementTiers(daoAddress: string): Promise<AchievementTier[]> {
		const daoCollectionResponse = await this.graphClient.daoCollection(daoAddress.toLowerCase());

		const { dao } = daoCollectionResponse || {};

		if (!dao || !this.validateDao(dao)) {
			throw new NotFoundError('[Get Achievement Details]: dao is not found');
		}

		const { collection: nftCollection } = dao;

		const baseURI = nftCollection.url;

		const metadataFetcher = new MetadataFetcher(baseURI);
		const collectionMetadata = await metadataFetcher.getCollectionMetadata();
		const tiers: (Omit<AchievementTier, 'salesActivity'> | null)[] = await Promise.all(
			nftCollection.tiers.map(async (tier) => {
				const extractedTiers = extractTierAttributes(tier);

				if (!extractedTiers) return null;

				const {
					maxAmount = 1,
					totalAmount,
					isRandom,
					hasRandomShuffleMint = false,
					isDeactivated,
					isTransferable
				} = extractedTiers;

				const isRandomArtworkType = isRandom || hasRandomShuffleMint;
				const tierArtworkType = isRandomArtworkType ? TierArtworkTypeStrings.random : TierArtworkTypeStrings.one;

				const tierHelperData: TierHelperData = {
					id: tier.nativeID,
					tierArtworkType: tierArtworkType,
					maxAmount,
					hasRandomShuffleMint
				};
				const found = collectionMetadata.tiers.find(
					(tierMeta) => tierMeta.toLowerCase() === tier.nativeID.toLowerCase()
				);
				if (!found) return null;

				const { artworks, artworksTotalLength, description, metadata } = await getTierMetadata(
					tierHelperData,
					metadataFetcher
				);

				if (!metadata) return null;

				if (!this.isAchievementTier(metadata)) return null;

				const attributes = processAttributesBeforeFrontend(toCamelCase(metadata.attributes));
				const { achievements, benefits, customProperties } = sortAttributesByPurpose(attributes);
				const parsedTier: Omit<AchievementTier, 'salesActivity'> = {
					id: tier.nativeID,
					collectionAddress: nftCollection.id,
					collectionName: nftCollection.name || '',
					description,
					totalPrice: {
						openSale: '',
						whitelistSale: ''
					},
					tierName: tier.name,
					isTransferable: isTransferable || false,
					// transferUnlockDate: Math.floor((transferUnlockDate || 0) * 3_600_000),
					isDeactivated: isDeactivated || false,
					tierArtworkType: isRandomArtworkType ? TierArtworkTypeStrings.random : TierArtworkTypeStrings.one,
					maxAmount: maxAmount || 0,
					totalAmount: totalAmount || 0,
					achievements,
					benefits,
					customProperties,
					artworks,
					artworksTotalLength,
					currency: '',
					metadata,
					nfts: tier.Nfts.map((nft) => this.transformGraphNftToAchievementNft(nft, metadata))
				};

				return parsedTier;
			})
		);

		const res = tiers.filter((tier) => !!tier) as any as AchievementTier[];

		return res;
	}

	async fetchAchievementTier(daoAddress: string, tierId: string) {
		const fetchAchievementTiers = await this.fetchAchievementTiers(daoAddress); // TODO direct request with graph client

		const achievementTier = fetchAchievementTiers.find((achievementTier) => achievementTier.id === tierId);

		if (!achievementTier) {
			throw new NotFoundError('[Get Achievement tier]: tier is not found');
		}

		return achievementTier;
	}

	async fetchAchievmentsOwners(daoAddress: string) {
		const daoCollectionOwnersResponse = await this.graphClient.daoCollectionOwners(daoAddress.toLowerCase());
		const owners = daoCollectionOwnersResponse?.dao?.collection?.nfts?.map(({ owner }) => owner);

		return owners;
	}
}
