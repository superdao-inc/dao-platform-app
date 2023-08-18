import { Injectable, Logger } from '@nestjs/common';
import { formatBytes32String, hexlify, hexZeroPad } from 'ethers/lib/utils';
import { BytesLike, ethers, PopulatedTransaction } from 'ethers';
import diffBy from 'lodash/differenceBy';
import toCamelCase from 'camelcase-keys';
import { wallet } from 'src/blockchain/common';
import { NftMetadata, TierArtworkTypeStrings } from 'src/entities/nft/nft.types';
import {
	RemovingTier,
	TierAttribute,
	TierHelperData,
	TierMeta,
	TiersWithAttributes,
	TierWithAttributes
} from 'src/entities/contract/types';
import { TIER_ATTRS_TO_REMOVE } from 'src/entities/contract/constants';
import { infuraService } from 'src/blockchain/services/infura';
import { ERC721Properties, ERC721Properties__factory, Kernel__factory } from 'src/typechain';
import {
	TIER_EXTRA_ARTWORKS_NUM,
	DEACTIVATED,
	DELETED,
	hexOneBytes32,
	IS_TRANSFERABLE,
	MAX_AMOUNT,
	NAME,
	TIER_PROP,
	TIER_RANDOM_MINT,
	TIER_RANDOM_SHUFFLE_MINT,
	TRANSFER_UNLOCKS_AT_HOURS
} from '@sd/superdao-shared';
import { getIpfsUrlByHash } from './utils';
import { MetadataFetcher } from './metadataFetcher';
import { ContractHelper } from './contract.helper';

const ERC_721_ID = 'ERC721';

@Injectable()
export class ERC721HelperService extends ContractHelper {
	private readonly logger = new Logger(ERC721HelperService.name);

	constructor(kernelFactory: Kernel__factory) {
		super(kernelFactory, ERC_721_ID);
	}

	getContractByContractAddress(contractAddress: string): ERC721Properties {
		return ERC721Properties__factory.connect(contractAddress, wallet);
	}

	async getContractByDaoAddress(daoAddress: string): Promise<ERC721Properties> {
		const addr = await this.getContractAddress(daoAddress);
		if (!addr) {
			const errorMsg = `[ERC721Contract] Can't get contract for daoAddress`;
			throw new Error(errorMsg);
		}
		return this.getContractByContractAddress(addr);
	}

	private async _getTierArtworkTypeOne(tier: TierHelperData, metadataFetcher: MetadataFetcher) {
		const artworks: NftMetadata[] = [];

		const metadata = await metadataFetcher.getTierMetadata(tier.id);
		const { animation_url, attributes: metaAttributes = [], image: metaImage, description = '' } = metadata;

		const image = typeof metaImage === 'string' ? getIpfsUrlByHash(metaImage) : '';
		const animationUrl = typeof animation_url === 'string' ? getIpfsUrlByHash(animation_url) : '';
		const attributes = metaAttributes.map((attr) => toCamelCase(attr));

		artworks.push({
			id: '0',
			image,
			animationUrl,
			attributes,
			description: description ?? ''
		});
		const artworksTotalLength = 1;

		return { artworks, artworksTotalLength, description };
	}

	private async _getTierArtworkTypeRandom(tier: TierHelperData, metadataFetcher: MetadataFetcher) {
		const artworks: NftMetadata[] = [];
		let artworksTotalLength = 0;
		let description = '';

		const baseURI = metadataFetcher.getBaseURI();
		const cid = baseURI.replace('ipfs://', '');
		const dagCid = tier.tierArtworkType === TierArtworkTypeStrings.random ? `${cid}/${tier.id}` : cid;
		const tierMetadataDagInfo = await infuraService.getDagInfo(dagCid);

		const files = await Promise.all(
			new Array(tierMetadataDagInfo.Links.length).fill(0).map(async (_, i) => {
				return metadataFetcher.getTierFile(tier.id, i);
			})
		);

		for (const metadata of files) {
			const {
				animation_url,
				attributes: metaAttributes = [],
				image: metaImage,
				description: metaDescription
			} = metadata;
			description = metaDescription ?? '';

			const image = typeof metaImage === 'string' ? getIpfsUrlByHash(metaImage) : '';
			const animationUrl = typeof animation_url === 'string' ? getIpfsUrlByHash(animation_url) : '';
			const attributes = metaAttributes.map((attr) => toCamelCase(attr));

			artworks.push({
				id: artworks.length.toString(),
				attributes,
				description,
				image,
				animationUrl
			});
			artworksTotalLength++;
		}

		return { artworks, artworksTotalLength, description };
	}

	async getTierMetadata(tier: TierHelperData, metadataFetcher: MetadataFetcher): Promise<TierMeta> {
		const artworks: NftMetadata[] = [];
		let artworksTotalLength = 0;
		let description = '';

		switch (tier.tierArtworkType) {
			case TierArtworkTypeStrings.one: {
				const {
					artworks: tierArtworks,
					description: tierDescription,
					artworksTotalLength: tierArtworksTotalLength
				} = await this._getTierArtworkTypeOne(tier, metadataFetcher);

				artworks.push(...tierArtworks);
				description = tierDescription ?? '';
				artworksTotalLength = tierArtworksTotalLength;

				break;
			}

			case TierArtworkTypeStrings.random: {
				const {
					artworks: tierArtworks,
					description: tierDescription = '',
					artworksTotalLength: tierArtworksTotalLength
				} = await this._getTierArtworkTypeRandom(tier, metadataFetcher);

				artworks.push(...tierArtworks);
				description = tierDescription;
				artworksTotalLength = tierArtworksTotalLength;

				break;
			}

			default:
				throw Error('Unknown tier type');
		}

		return {
			artworks,
			artworksTotalLength,
			description
		};
	}

	public async deleteNftTierTx(erc721CollectionAddress: string, tier: string) {
		const erc721 = this.getContractByContractAddress(erc721CollectionAddress);

		const tx = await erc721.populateTransaction.setAttribute(
			TIER_PROP,
			formatBytes32String(tier.toUpperCase()),
			DELETED,
			hexOneBytes32
		);

		return { ...tx, from: undefined };
	}

	public async getTreasuryWallet(daoAddress: string) {
		const kernel = this.kernelFactory.attach(daoAddress);

		try {
			const treasuryWallet = await kernel.getTreasury();
			return treasuryWallet;
		} catch (e) {
			this.logger.error(`[Treasury wallet] Error while getting treasury wallet`, { daoAddress, kernel, e });
			return null;
		}
	}

	public async isTierTransferable(contract: ERC721Properties, tier: string): Promise<boolean> {
		const isTransferableBytes = await contract.getAttribute(
			TIER_PROP,
			ethers.utils.formatBytes32String(tier.toUpperCase()),
			IS_TRANSFERABLE
		);

		return ethers.BigNumber.from(isTransferableBytes).toNumber() === 1;
	}

	public async setTierTransferable(
		contract: ERC721Properties,
		tier: string,
		isTransferable: boolean
	): Promise<ethers.PopulatedTransaction> {
		return contract.populateTransaction.setAttribute(
			TIER_PROP,
			ethers.utils.formatBytes32String(tier.toUpperCase()),
			IS_TRANSFERABLE,
			ethers.utils.hexZeroPad(ethers.BigNumber.from(isTransferable ? 1 : 0).toHexString(), 32)
		);
	}

	public async getTransferableUnlockDate(contract: ERC721Properties, tier: string): Promise<Date> {
		const hours = await contract.getAttribute(
			TIER_PROP,
			ethers.utils.formatBytes32String(tier.toUpperCase()),
			TRANSFER_UNLOCKS_AT_HOURS
		);

		return new Date(Math.floor(ethers.BigNumber.from(hours).toNumber() * 60 * 60 * 1000));
	}

	public async setTransferableUnlockDate(
		contract: ERC721Properties,
		tier: string,
		date: Date
	): Promise<ethers.PopulatedTransaction> {
		return contract.populateTransaction.setAttribute(
			TIER_PROP,
			ethers.utils.formatBytes32String(tier.toUpperCase()),
			TRANSFER_UNLOCKS_AT_HOURS,
			ethers.utils.hexZeroPad(ethers.BigNumber.from(Math.floor(date.getTime() / 1000 / 60 / 60)).toHexString(), 32)
		);
	}

	public async getMaxAmount(contract: ERC721Properties, tier: string): Promise<ethers.BigNumber> {
		const maxAmount = await contract.getAttribute(
			TIER_PROP,
			ethers.utils.formatBytes32String(tier.toUpperCase()),
			MAX_AMOUNT
		);

		return ethers.BigNumber.from(maxAmount);
	}

	public async setMaxAmount(
		contract: ERC721Properties,
		tier: string,
		maxAmount: ethers.BigNumber
	): Promise<ethers.PopulatedTransaction> {
		return contract.populateTransaction.setAttribute(
			TIER_PROP,
			ethers.utils.formatBytes32String(tier.toUpperCase()),
			MAX_AMOUNT,
			ethers.utils.hexZeroPad(maxAmount.toHexString(), 32)
		);
	}

	public async getRandomValue(contract: ERC721Properties, tier: string): Promise<string> {
		return contract.getAttribute(TIER_PROP, ethers.utils.formatBytes32String(tier.toUpperCase()), TIER_RANDOM_MINT);
	}

	public async isRandom(contract: ERC721Properties, tier: string): Promise<boolean> {
		const randomValue = await this.getRandomValue(contract, tier);

		return !ethers.BigNumber.from(randomValue).isZero();
	}

	public async isRandomWrong(contract: ERC721Properties, tier: string): Promise<boolean> {
		const randomValue = await this.getRandomValue(contract, tier);

		const isZero = ethers.BigNumber.from(randomValue).isZero();
		return isZero ? false : !randomValue?.startsWith('0x01');
	}

	public async setRandom(
		contract: ERC721Properties,
		tier: string,
		value: boolean,
		tokenCount: ethers.BigNumber,
		artworksCount: number = 0
	): Promise<ethers.PopulatedTransaction> {
		// When we need to enable random we use setRandomMint method, else we set attribute to zero
		if (value) {
			return contract.populateTransaction.setRandomMint(
				ethers.utils.formatBytes32String(tier.toUpperCase()),
				tokenCount,
				ethers.BigNumber.from(artworksCount).toHexString()
			);
		}

		return contract.populateTransaction.setAttribute(
			TIER_PROP,
			ethers.utils.formatBytes32String(tier.toUpperCase()),
			TIER_RANDOM_MINT,
			ethers.utils.hexZeroPad(ethers.BigNumber.from(0).toHexString(), 32)
		);
	}

	public async getRandomShuffleValue(contract: ERC721Properties, tier: string): Promise<string> {
		return contract.getAttribute(
			TIER_PROP,
			ethers.utils.formatBytes32String(tier.toUpperCase()),
			TIER_RANDOM_SHUFFLE_MINT
		);
	}

	public async hasRandomShuffleMint(contract: ERC721Properties, tier: string): Promise<boolean> {
		const randomShuffleValue = await this.getRandomShuffleValue(contract, tier);

		return !ethers.BigNumber.from(randomShuffleValue).isZero();
	}

	public async hasRandomShuffleMintWrong(contract: ERC721Properties, tier: string): Promise<boolean> {
		const randomShuffleValue = await this.getRandomShuffleValue(contract, tier);

		const isZero = ethers.BigNumber.from(randomShuffleValue).isZero();
		return isZero ? false : !randomShuffleValue?.startsWith('0x01');
	}

	public async setRandomShuffleMint(
		contract: ERC721Properties,
		tier: string,
		value: boolean,
		tokenCount: ethers.BigNumber
	): Promise<ethers.PopulatedTransaction> {
		// When we need to enable random we use setRandomShuffleMint method, else we set attribute to zero
		if (value) {
			return contract.populateTransaction.setRandomShuffleMint(
				ethers.utils.formatBytes32String(tier.toUpperCase()),
				tokenCount
			);
		}

		return contract.populateTransaction.setAttribute(
			TIER_PROP,
			ethers.utils.formatBytes32String(tier.toUpperCase()),
			TIER_RANDOM_SHUFFLE_MINT,
			ethers.utils.hexZeroPad(ethers.BigNumber.from(0).toHexString(), 32)
		);
	}

	public async getArtworksCount(contract: ERC721Properties, tier: string): Promise<number> {
		const count = await contract.getAttribute(
			TIER_PROP,
			ethers.utils.formatBytes32String(tier.toUpperCase()),
			TIER_EXTRA_ARTWORKS_NUM
		);

		return ethers.BigNumber.from(count).toNumber();
	}

	public async setArtworksCount(
		contract: ERC721Properties,
		tier: string,
		value: number
	): Promise<ethers.PopulatedTransaction> {
		return contract.populateTransaction.setAttribute(
			TIER_PROP,
			ethers.utils.formatBytes32String(tier.toUpperCase()),
			TIER_EXTRA_ARTWORKS_NUM,
			ethers.utils.hexZeroPad(ethers.BigNumber.from(value).toHexString(), 32)
		);
	}

	public async getTierName(contract: ERC721Properties, tier: string): Promise<string> {
		const bytesName = await contract.getAttribute(
			TIER_PROP,
			ethers.utils.formatBytes32String(tier.toUpperCase()),
			NAME
		);

		return ethers.utils.parseBytes32String(bytesName);
	}

	public async setTierName(
		contract: ERC721Properties,
		tier: string,
		value: string
	): Promise<ethers.PopulatedTransaction> {
		return contract.populateTransaction.setAttribute(
			TIER_PROP,
			ethers.utils.formatBytes32String(tier.toUpperCase()),
			NAME,
			ethers.utils.formatBytes32String(value)
		);
	}

	public async removeTiers(
		erc721: ERC721Properties,
		newTiers: RemovingTier[],
		oldTiers: RemovingTier[]
	): Promise<ethers.PopulatedTransaction[] | undefined> {
		try {
			// Just helper to reduce boilerplate
			const populatePropTx = (tierId: string, key: string, value: BytesLike) =>
				erc721.populateTransaction.setAttribute(TIER_PROP, formatBytes32String(tierId.toUpperCase()), key, value);

			// Detect tiers that was marked for deleting by user
			// When old tiers empty we have nothing to delete
			const deleteTiers = oldTiers.length ? diffBy(oldTiers, newTiers, 'id') : [];
			if (deleteTiers.filter((tier) => !!tier.totalAmount).length)
				throw Error('Attempting to delete tiers with minted NFTs');

			// Get tiers marked as deactivated only on client-side
			// When old tiers empty we have nothing to deactivate
			const deactivateTiers = oldTiers.length
				? diffBy(
						newTiers.map((t) => ({ ...t, isDeactivated: Boolean(t?.isDeactivated) })),
						oldTiers.map((t) => ({ ...t, isDeactivated: Boolean(t?.isDeactivated) })),
						'isDeactivated'
				  )
				: [];

			/**
			 * Deleting: for tiers no one else owns (NFTs was burned) reset all attributes to zero
			 * */
			const notMintedTxs: PopulatedTransaction[] = [];
			for (const tier of deleteTiers) {
				for (const attrName of TIER_ATTRS_TO_REMOVE) {
					notMintedTxs.push(await populatePropTx(tier.id, attrName, ethers.constants.HashZero));
				}
				/**
				 * DELETED=1 must be last transaction of a tier, so The Graph could correctly remove it from DB
				 */
				notMintedTxs.push(await populatePropTx(tier.id, DELETED, hexOneBytes32));
			}

			/**
			 * Deactivating: mark tiers that still have owners as deactivated and stop selling by limit max. amount
			 */
			const mintedTxs: PopulatedTransaction[] = [];
			for (const tier of deactivateTiers) {
				mintedTxs.push(
					await populatePropTx(tier.id, DEACTIVATED, hexOneBytes32),
					await populatePropTx(tier.id, IS_TRANSFERABLE, ethers.constants.HashZero),
					await populatePropTx(tier.id, MAX_AMOUNT, hexZeroPad(hexlify(tier.totalAmount ?? 0), 32))
				);
			}

			return [...notMintedTxs, ...mintedTxs];
		} catch (error: any) {
			this.logger.error('[RemoveTiers] can`t populate removeTiers transaction', {
				message: error?.message,
				stack: error?.stack
			});
		}
	}

	async getTiersWithAttributes(
		erc721: ERC721Properties,
		tiersIds: string[],
		attributes: TierAttribute[]
	): Promise<TiersWithAttributes> {
		const tiers: TiersWithAttributes = {};

		try {
			const rawTiersWithAttributes = await Promise.all(
				tiersIds.map(async (tierId) => {
					const tierAttributes = await this.getTierAttributes(erc721, tierId, attributes);
					return { tierId, tierAttributes };
				})
			);

			for (const { tierId, tierAttributes } of rawTiersWithAttributes) {
				tiers[tierId] = tierAttributes;
			}
		} catch (error) {
			this.logger.error('[ERC721Contract.getTiersWithAttributes]', error);
		}

		return tiers;
	}

	async getTierAttributes(
		erc721: ERC721Properties,
		tierId: string,
		attributes: TierAttribute[]
	): Promise<TierWithAttributes> {
		const get = async (property: string) =>
			erc721.getAttribute('TIER', ethers.utils.formatBytes32String(tierId), property);
		const values = await Promise.all(
			attributes.map(async (attr) => {
				const encoded = await get(attr.name.toString());
				switch (attr.type) {
					case 'boolean':
						return encoded !== ethers.constants.HashZero;
					case 'number':
						return ethers.BigNumber.from(encoded).toNumber();
					case 'string':
						return ethers.utils.parseBytes32String(encoded);
				}
			})
		);

		return Object.fromEntries(attributes.map((attr, i) => [attr.name, values[i]]));
	}
}
