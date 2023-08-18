import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

// exceptions
import { assertNotFound } from 'src/exceptions/assert';

// services
import { MetadataFetcher } from 'src/entities/contract/metadataFetcher';
import { ContractService } from 'src/entities/contract/contract.service';
import { ERC721HelperService } from 'src/entities/contract/erc721Helper.service';
import { ERC721Properties } from 'src/typechain';

// constants
import { DEFAULT_CURRENCY } from 'src/services/blockchain/collection/collection.constants';

// gql sdk
import { GraphQLClient } from 'graphql-request';
import { tierAttributes } from 'src/services/blockchain/collection/constants';
import { ERC721CollectionMetadata } from 'src/types/metadata';
import { getSdk } from './gql/collection.generated';

import { TIER_ATTRIBUTES } from '@sd/superdao-shared';

// helpers
import { BlockchainArtworkHelper } from './helpers/artwork.helper';
import { BlockchainCollectionHelper } from './helpers/collection.helper';
import { BlockchainTierHelper } from './helpers/tier.helper';

// types
import {
	Tier,
	TierArtworkResponse,
	AttributeStructure,
	TierResponse,
	CollectionResponse,
	TierWithOwnersResponse,
	TierWithOwners
} from './collection.types';

const { HashZero } = ethers.constants;
const { formatBytes32String } = ethers.utils;
const { TIER_RANDOM_SHUFFLE_MINT, TIER_RANDOM_MINT } = TIER_ATTRIBUTES;

@Injectable()
export class BlockchainCollectionService {
	private readonly logger = new Logger(BlockchainCollectionService.name);

	private readonly client: GraphQLClient;
	private readonly sdk: ReturnType<typeof getSdk>;

	constructor(
		private readonly configService: ConfigService,
		private readonly blockchainArtworkHelper: BlockchainArtworkHelper,
		private readonly blockchainCollectionHelper: BlockchainCollectionHelper,
		private readonly blockchainTierHelper: BlockchainTierHelper,
		private readonly contractService: ContractService
	) {
		const url = this.configService.get('polygonGraph.url');
		this.client = new GraphQLClient(url);

		this.sdk = getSdk(this.client);
	}

	/**
	 * Get ERC721 helper & ERC721 properties contract
	 * @param daoAddress kernel address, ie: `0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1`
	 * @private
	 */
	private async getERC721(daoAddress: string): Promise<[ERC721Properties, ERC721HelperService]> {
		const erc721Helper = await this.contractService.getERC721Helper();
		assertNotFound(erc721Helper, 'ERC721 helper not found');

		const erc721PropertiesContract = await erc721Helper.getContractByDaoAddress(daoAddress);
		assertNotFound(erc721PropertiesContract, 'ERC721 properties contract not found');

		return [erc721PropertiesContract, erc721Helper];
	}

	/**
	 * Validate if tier exists
	 * @param tierId tier id, ie: DFA62D50D0C146139BA5A8296A961C0
	 * @param collectionMetadata
	 * @private
	 */
	private validateTierInMetadata(tierId: string, collectionMetadata: ERC721CollectionMetadata): void {
		const tier = collectionMetadata.tiers.find((tier) => tier.toUpperCase() === tierId.toUpperCase());
		assertNotFound(tier, 'Tier not found');
	}

	/////////////////////////////
	// Tier's artworks methods //
	/////////////////////////////

	/**
	 * Get the tier's artworks
	 * @param daoAddress kernel address, ie: `0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1`
	 * @param tierId tier id, ie: DFA62D50D0C146139BA5A8296A961C0
	 * @param maxArtworks max artworks to return
	 */
	async getArtworks(daoAddress: string, tierId: string, maxArtworks: number): Promise<TierArtworkResponse> {
		daoAddress = daoAddress.toLowerCase();
		tierId = tierId.toUpperCase();

		try {
			this.blockchainArtworkHelper.validateGetArtworksParams(daoAddress, tierId);

			const collectionAddressResponse = await this.sdk.getERC721Info({ id: daoAddress });

			const { id: collectionAddress, url: ipfsHash } = collectionAddressResponse.dao?.collection ?? {};
			assertNotFound(collectionAddress, 'Collection address not found');
			assertNotFound(ipfsHash, 'Collection ipfs hash not found');

			const metadataFetcher = new MetadataFetcher(ipfsHash);
			const collectionMetadata = await metadataFetcher.getCollectionMetadata();
			this.validateTierInMetadata(tierId, collectionMetadata);

			const graphTierId = this.blockchainTierHelper.getGraphTierId(collectionAddress, tierId);
			const tierAttributesResponse = await this.sdk.getTierAttributes({ id: graphTierId });

			const tier = tierAttributesResponse.tier;
			assertNotFound(tier, 'Tier not found');

			const attributes = tier.attributes;
			assertNotFound(attributes, 'Tier attributes not found');

			const isRandomKey = (key: string | null | undefined) => {
				if (!key) return false;

				const randomKeys: string[] = [TIER_RANDOM_SHUFFLE_MINT, TIER_RANDOM_MINT];
				return randomKeys.includes(key);
			};
			const isRandom = attributes && attributes.some(({ key, value }) => isRandomKey(key) && value !== HashZero);

			if (isRandom) {
				return this.blockchainArtworkHelper.getRandomArtworkType(tierId, metadataFetcher, maxArtworks);
			}

			return this.blockchainArtworkHelper.getTierArtworkTypeOne(tierId, metadataFetcher);
		} catch (e) {
			this.logger.error(` [get-artwork] Fail to get the artwork `, { e });
			throw e;
		}
	}

	/**
	 * Get tier's attributes for deprecated DAOs
	 * @param daoAddress kernel address, ie: `0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1`
	 * @param tierId tier id, ie: DFA62D50D0C146139BA5A8296A961C0
	 * @param maxArtworks max artworks to return
	 */
	async getDeprecatedArtworks(daoAddress: string, tierId: string, maxArtworks: number): Promise<TierArtworkResponse> {
		daoAddress = daoAddress.toLowerCase();
		tierId = tierId.toUpperCase();

		try {
			this.blockchainArtworkHelper.validateGetArtworksParams(daoAddress, tierId);

			const [erc721PropertiesContract] = await this.getERC721(daoAddress);
			const ipfsHash = await erc721PropertiesContract.baseURI();
			assertNotFound(ipfsHash, 'Collection IPFS hash not found');

			const metadataFetcher = new MetadataFetcher(ipfsHash);
			const collectionMetadata = await metadataFetcher.getCollectionMetadata();
			this.validateTierInMetadata(tierId, collectionMetadata);

			const attrPromises = [];
			const formattedTier = formatBytes32String(tierId);

			attrPromises.push(erc721PropertiesContract.getAttribute('TIER', formattedTier, TIER_RANDOM_MINT));
			attrPromises.push(erc721PropertiesContract.getAttribute('TIER', formattedTier, TIER_RANDOM_SHUFFLE_MINT));

			const [randomAttr, randomShuffleAttr] = await Promise.all(attrPromises);
			const [isRandom, isRandomShuffle] = [randomAttr, randomShuffleAttr].map((attr) => attr !== HashZero);

			if (isRandom || isRandomShuffle) {
				return this.blockchainArtworkHelper.getRandomArtworkType(tierId, metadataFetcher, maxArtworks);
			}

			return this.blockchainArtworkHelper.getTierArtworkTypeOne(tierId, metadataFetcher);
		} catch (e) {
			this.logger.error(` [get-artwork] Fail to get the artwork `, { e });
			throw e;
		}
	}

	/////////////////////////////
	// Collection tier
	/////////////////////////////

	/**
	 * Get the collection tier
	 * @param daoAddress kernel address, ie: `0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1`
	 * @param tierId tier id, ie: DFA62D50D0C146139BA5A8296A961C0
	 * @param maxArtworks max artworks to return
	 */
	async getCollectionTier(daoAddress: string, tierId: string, maxArtworks = 0): Promise<TierResponse> {
		daoAddress = daoAddress.toLowerCase();
		tierId = tierId.toUpperCase();

		try {
			this.blockchainTierHelper.validateGetCollectionTierParams(daoAddress, tierId);

			const ERC721Info = await this.sdk.getERC721Info({ id: daoAddress });
			assertNotFound(ERC721Info.dao?.collection, 'Collection not found');

			const { collection, openSale, privateSale } = ERC721Info.dao;

			const { id: collectionAddress, url: ipfsHash, name: collectionName } = collection;
			assertNotFound(collectionAddress, 'Collection address not found');
			assertNotFound(ipfsHash, 'Collection ipfs hash not found');

			const metadataFetcher = new MetadataFetcher(ipfsHash);
			const collectionMetadata = await metadataFetcher.getCollectionMetadata();
			this.validateTierInMetadata(tierId, collectionMetadata);

			const graphTierId = this.blockchainTierHelper.getGraphTierId(collectionAddress, tierId);
			const tierInfo = await this.sdk.getTierInfo({ id: graphTierId });
			assertNotFound(tierInfo.tier, 'Tier not found');

			const { nativeID, attributes, name } = tierInfo.tier;

			const [tierArtworks] = await Promise.all([this.getArtworks(daoAddress, tierId, maxArtworks)]);

			const { artworks, artworksTotalLength, description } = tierArtworks;

			const mappedAttributes = this.blockchainTierHelper.mapAttributes(attributes as AttributeStructure[]);
			const totalPrice = await this.blockchainTierHelper.getTierPrices(openSale, privateSale, nativeID);

			const isRandom = mappedAttributes.hasRandomShuffleMint || mappedAttributes.isRandom;
			const tierArtworkType = isRandom ? 'random' : 'one';

			const result: Tier = {
				...mappedAttributes,
				currency: DEFAULT_CURRENCY,
				id: nativeID,
				name,
				artworks,
				artworksTotalLength,
				collectionAddress,
				collectionName,
				description,
				totalPrice,
				tierArtworkType
			};

			return { value: result };
		} catch (e) {
			this.logger.error(` [get-collection-tier] Fail to get the collection tier `, { e });
			throw e;
		}
	}

	/**
	 * FIXME: must be deleted, owners must be fetched separately
	 * Get the collection tier for deprecated DAOs
	 * @param daoAddress kernel address, ie: `0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1`
	 * @param tierId tier id, ie: DFA62D50D0C146139BA5A8296A961C0
	 * @param maxArtworks max artworks to return
	 * @deprecated
	 */
	async getCollectionTierWithOwners(
		daoAddress: string,
		tierId: string,
		maxArtworks = 0
	): Promise<TierWithOwnersResponse> {
		daoAddress = daoAddress.toLowerCase();
		tierId = tierId.toUpperCase();

		try {
			this.blockchainTierHelper.validateGetCollectionTierParams(daoAddress, tierId);

			const tier = await this.getCollectionTier(daoAddress, tierId, maxArtworks);

			const { collectionAddress, name } = tier.value;
			const owners = await this.blockchainTierHelper.getTierOwners(collectionAddress, tierId, name);

			const result: TierWithOwners = {
				...tier.value,
				owners
			};

			return { value: result };
		} catch (e) {
			this.logger.error(` [get-collection-tier-with-owners] Fail to get the collection tier `, { e });
			throw e;
		}
	}

	/**
	 * Get the collection tier for deprecated DAOs
	 * @param daoAddress kernel address, ie: `0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1`
	 * @param tierId tier id, ie: DFA62D50D0C146139BA5A8296A961C0
	 * @param maxArtworks max artworks to return
	 */
	async getDeprecatedCollectionTier(daoAddress: string, tierId: string, maxArtworks = 0): Promise<TierResponse> {
		daoAddress = daoAddress.toLowerCase();
		tierId = tierId.toUpperCase();

		try {
			this.blockchainTierHelper.validateGetCollectionTierParams(daoAddress, tierId);

			const [erc721PropertiesContract] = await this.getERC721(daoAddress);
			const [ipfsHash, collectionAddress] = await Promise.all([
				erc721PropertiesContract.baseURI(),
				this.contractService.getCollectionAddress(daoAddress)
			]);
			assertNotFound(ipfsHash, 'Collection IPFS hash not found');
			assertNotFound(collectionAddress, 'Collection address not found');

			const metadataFetcher = new MetadataFetcher(ipfsHash);

			const [collectionMetadata, tierMetadata] = await Promise.all([
				metadataFetcher.getCollectionMetadata(),
				metadataFetcher.getTierMetadata(tierId)
			]);

			this.validateTierInMetadata(tierId, collectionMetadata);

			const [attributes, totalPrice] = await Promise.all([
				this.blockchainTierHelper.getTierAttributes(erc721PropertiesContract, tierId, tierAttributes),
				this.contractService.getTierSalesPrices(daoAddress, tierId)
			]);

			const mappedAttributes = this.blockchainTierHelper.mapAttributes(attributes);
			const isRandom = mappedAttributes.hasRandomShuffleMint || mappedAttributes.isRandom;
			const tierArtworkType = isRandom ? 'random' : 'one';

			const { artworks, artworksTotalLength, description } = await this.getDeprecatedArtworks(
				daoAddress,
				tierId,
				maxArtworks
			);

			const result: Tier = {
				...mappedAttributes,
				currency: DEFAULT_CURRENCY,
				id: tierId,
				name: tierMetadata.name,
				collectionName: collectionMetadata.name,
				artworks,
				artworksTotalLength,
				collectionAddress,
				description,
				totalPrice,
				tierArtworkType
			};

			return { value: result };
		} catch (e) {
			this.logger.error(` [get-collection-tier] Fail to get the collection tier `, { e });
			throw e;
		}
	}

	/**
	 * Get the collection
	 * @param daoAddress kernel address, ie: `0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1`
	 * @param maxTiers
	 */
	async getCollection(daoAddress: string, maxTiers = 0): Promise<CollectionResponse> {
		daoAddress = daoAddress.toLowerCase();

		try {
			this.blockchainCollectionHelper.validateGetCollectionParams(daoAddress);

			const collectionInfo = await this.sdk.getCollectionInfo({ id: daoAddress });

			const { id: collectionAddress, url: ipfsHash, tiers: tiersIds } = collectionInfo.dao?.collection ?? {};
			assertNotFound(collectionAddress, 'Collection address not found');
			assertNotFound(ipfsHash, 'Collection ipfs hash not found');

			const metadataFetcher = new MetadataFetcher(ipfsHash);
			const collectionMetadata = await metadataFetcher.getCollectionMetadata();
			const { name, description } = collectionMetadata;

			let ids: string[] = [];
			for (let i = 0; tiersIds && i < tiersIds.length; i++) {
				const found = collectionMetadata.tiers.find(
					(tier) => tier.toLowerCase() === tiersIds[i].nativeID.toLowerCase()
				);
				if (!found) continue;

				ids.push(tiersIds[i].nativeID);
			}
			if (maxTiers > 0) ids.slice(0, maxTiers);

			const tierPromises = ids.map((tierId) => this.getCollectionTier(daoAddress, tierId));
			const resolvedTiers = await Promise.all(tierPromises);
			const tiers: Tier[] = resolvedTiers.map(({ value }) => value);

			return {
				name,
				description,
				collectionAddress,
				tiers
			};
		} catch (e) {
			this.logger.error(` [get-collection] Fail to get the collection `, { e });
			throw e;
		}
	}

	/**
	 * Get the collection for deprecated DAOs
	 * @param daoAddress kernel address, ie: `0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1`
	 * @param maxTiers max tiers to return
	 */
	async getDeprecatedCollection(daoAddress: string, maxTiers = 0): Promise<CollectionResponse> {
		daoAddress = daoAddress.toLowerCase();

		try {
			this.blockchainCollectionHelper.validateGetCollectionParams(daoAddress);

			const [erc721PropertiesContract] = await this.getERC721(daoAddress);

			const [ipfsHash, collectionAddress] = await Promise.all([
				erc721PropertiesContract.baseURI(),
				this.contractService.getCollectionAddress(daoAddress)
			]);
			assertNotFound(collectionAddress, 'Collection address not found');
			assertNotFound(ipfsHash, 'Collection IPFS hash not found');

			const metadataFetcher = new MetadataFetcher(ipfsHash);
			const collectionMetadata = await metadataFetcher.getCollectionMetadata();
			const { name, description, tiers: tierIds } = collectionMetadata;

			const ids = tierIds?.slice(0, maxTiers || collectionMetadata.tiers.length) || [];
			const tierPromises = ids.map((tierId) => this.getDeprecatedCollectionTier(daoAddress, tierId));

			const resolvedTiers = await Promise.all(tierPromises);
			const tiers: Tier[] = resolvedTiers.map(({ value }) => value);

			return {
				name,
				description,
				collectionAddress,
				tiers
			};
		} catch (e) {
			this.logger.error(` [get-collection] Fail to get the collection `, { e });
			throw e;
		}
	}
}
