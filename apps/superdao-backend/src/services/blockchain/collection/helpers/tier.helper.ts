import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

// gql sdk
import { GraphQLClient } from 'graphql-request';
import { getSdk } from 'src/services/blockchain/collection/gql/collection.generated';

// exceptions
import { assertNotValid } from 'src/exceptions/assert';

// types
import { OpenSaleApp, PrivateSaleApp } from 'src/services/the-graph/graph-polygon/types.generated';
import { AttributeStructure, MappedAttributes, TierOwners } from 'src/services/blockchain/collection/collection.types';
import { ERC721Properties } from 'src/typechain';
import { TierAttribute } from 'src/entities/contract/types';
import { TotalPrice } from 'src/entities/nft/nft.types';
import { ATTIRIBUTES_TO_KEY_MAP, TIER_ATTRIBUTE_VALUE, TIER_ATTRIBUTES, TIER_TYPES } from '@sd/superdao-shared';

// utils
const { HashZero } = ethers.constants;
const { parseBytes32String, formatBytes32String, isAddress } = ethers.utils;

@Injectable()
export class BlockchainTierHelper {
	private readonly logger = new Logger(BlockchainTierHelper.name);

	private readonly client: GraphQLClient;
	private readonly sdk: ReturnType<typeof getSdk>;

	constructor(private readonly configService: ConfigService) {
		const url = this.configService.get('polygonGraph.url');
		this.client = new GraphQLClient(url);

		this.sdk = getSdk(this.client);
	}

	/**
	 * Validate the params for the getCollectionTier methods
	 * @param daoAddress kernel address, ie: 0xe8062a97D888Bb4eAD4025377D26E984D34bf00A
	 * @param tierId tier id, ie: DFA62D50D0C146139BA5A8296A961C0
	 */
	validateGetCollectionTierParams(daoAddress: string, tierId: string) {
		assertNotValid(tierId, 'Tier id is required');
		assertNotValid(isAddress(daoAddress), 'Invalid dao address');
	}

	/**
	 * Check if the attribute key is a tier attribute
	 * @param maybeAttribute
	 */
	isAttributeKey(maybeAttribute: string): maybeAttribute is TIER_ATTRIBUTE_VALUE {
		return TIER_ATTRIBUTES[maybeAttribute] !== undefined;
	}

	/**
	 * Get the-graph tier id. It's a combination of the collection address and the tier name
	 * @param collectionAddress collection address, ie: 0xe8062a97D888Bb4eAD4025377D26E984D34bf00A
	 * @param tierId tier id, ie: DFA62D50D0C146139BA5A8296A961C0
	 */
	getGraphTierId(collectionAddress: string, tierId: string) {
		collectionAddress = collectionAddress.toLowerCase();
		tierId = tierId.toUpperCase();

		return `${collectionAddress}-${tierId}`;
	}

	/**
	 * Get the tier type by the tier name
	 * @param key tier attribute key
	 * @param value tier attribute value
	 */
	getAttributeValueByType(
		key: TIER_ATTRIBUTE_VALUE,
		value: string | null | undefined
	): string | boolean | number | null {
		const type = TIER_TYPES[key];

		switch (type) {
			case 'boolean':
				return value ? value !== HashZero : false;
			case 'number':
				return value ? ethers.BigNumber.from(value).toNumber() : 0;
			case 'string':
				return value ? parseBytes32String(value) : '';
			default:
				return null;
		}
	}

	/**
	 * Get the tier attributes
	 * @param attributes
	 */
	mapAttributes(attributes?: AttributeStructure[]): MappedAttributes {
		const mappedAttributes = {} as MappedAttributes;

		for (const [attr, key] of Object.entries(ATTIRIBUTES_TO_KEY_MAP)) {
			const attribute = attributes?.find((attribute) => attribute.key === attr);
			if (!this.isAttributeKey(attr)) continue; // For typescript

			mappedAttributes[key] = this.getAttributeValueByType(attr, attribute?.value);
		}

		return mappedAttributes;
	}

	/**
	 * Get the tier owners
	 * @param collectionAddress collection address, ie: 0xe8062a97D888Bb4eAD4025377D26E984D34bf00A
	 * @param tierId tier id, ie: DFA62D50D0C146139BA5A8296A961C0
	 * @param tierName tier name
	 */
	async getTierOwners(collectionAddress: string, tierId: string, tierName: string): Promise<TierOwners> {
		try {
			const graphTierId = this.getGraphTierId(collectionAddress, tierId);
			const tierOwnersResponse = await this.sdk.getTierOwners({ id: graphTierId });

			const { Nfts: nfts } = tierOwnersResponse?.tier || {};

			const owners: TierOwners = {};
			for (let i = 0; nfts && i < nfts.length; i++) {
				const { owner, tokenID } = nfts[i];
				const { id } = owner;

				if (!owners[id]) {
					owners[id] = [];
				}

				owners[id].push({ name: tierName, tokenId: tokenID });
			}

			return owners;
		} catch (e) {
			this.logger.error(` [get-tier-owners] Fail to get the tier owners `, { e });
			throw e;
		}
	}

	/**
	 * Get the tier prices
	 * @param openSale
	 * @param privateSale
	 * @param nativeID tier id, ie: DFA62D50D0C146139BA5A8296A961C0
	 */
	async getTierPrices(
		openSale?: Pick<OpenSaleApp, 'tierIds' | 'tierPrices'> | null,
		privateSale?: Pick<PrivateSaleApp, 'tierIds' | 'tierPrices'> | null,
		nativeID?: string
	): Promise<TotalPrice> {
		const { tierIds: openSaleTierIds, tierPrices: openSaleTierPrices } = openSale ?? {};
		const { tierIds: privateSaleTierIds, tierPrices: privateSaleTierPrices } = privateSale ?? {};

		const openSaleIndex = openSaleTierIds?.findIndex((id) => id === nativeID) || -1;
		const openSalePrice = openSaleTierPrices?.[openSaleIndex] || '';
		const privateSaleIndex = privateSaleTierIds?.findIndex((id) => id === nativeID) || -1;
		const privateSalePrice = privateSaleTierPrices?.[privateSaleIndex] || '';

		return {
			openSale: openSalePrice,
			whitelistSale: privateSalePrice
		};
	}

	/**
	 * Get the tier attributes
	 * @param erc721
	 * @param tierId
	 * @param attributes
	 */
	async getTierAttributes(
		erc721: ERC721Properties,
		tierId: string,
		attributes: TierAttribute[]
	): Promise<AttributeStructure[]> {
		const get = async (property: string) => erc721.getAttribute('TIER', formatBytes32String(tierId), property);

		const values = await Promise.all(
			attributes.map(async (attr) => {
				return await get(attr.name.toString());
			})
		);

		return attributes.map((attr, i) => {
			return {
				key: attr.name.toString(),
				value: values[i]
			};
		});
	}
}
