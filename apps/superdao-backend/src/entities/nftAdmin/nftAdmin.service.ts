import { ethers, PopulatedTransaction } from 'ethers';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SocketService } from 'src/services/socket/socket.service';
import {
	CacheService,
	getCollectionArtworksKey,
	getCollectionsKey,
	getCollectionTierKey,
	getIsOpenSaleActiveKey,
	getIsPrivateSaleActiveKey,
	getNftAdminServiceCollectionKey,
	getOpenSaleTokenAddressKey,
	getTierSalesPricesKey
} from 'src/services/cache';
import { CollectionsService } from 'src/entities/collections/collections.service';
import { encodeTierData } from 'src/entities/ipfsMetadata/utils';
import { IpfsMetadataService } from 'src/entities/ipfsMetadata/ipfsMetadata.service';
import { NotFoundError } from 'src/exceptions';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
import { MessageData, NftAdminUpdateCollectionMessage, NftAdminUpdateSaleMessage } from 'src/entities/blockchain/types';
import { UserService } from 'src/entities/user/user.service';
import { Dao } from 'src/entities/dao/dao.model';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import { TierHelperData } from 'src/entities/contract/types';
import { TierConfigService } from 'src/entities/tierConfig/tierConfig.service';
import { OpenSaleContract } from 'src/entities/contract/openSaleContract';

import { TransactionBrokerService } from 'src/services/messageBroker/transaction/transactionBroker.service';
import { processAttributesBeforeFrontend, sortAttributesByPurpose } from 'src/utils/nftAttributes';
import {
	NftAdminCollectionResponse,
	NftAdminUpdateCollectionInput,
	NftAdminUpdateCollectionTxInput,
	NftAdminUpdateSaleInput,
	SaleConfig
} from './nftAdmin.types';
import {
	AVAILABLE_TOKENS_LIST,
	getTokenSymbolByAddress,
	MessageName,
	POLYGON_ADDRESS_MAP,
	SaleType,
	SaleTypeIndex,
	TIER_ATTRIBUTES
} from '@sd/superdao-shared';
import { ContractService } from '../contract/contract.service';
import { TierArtworkTypeStrings } from '../nft/nft.types';
import { MetadataFetcher } from '../contract/metadataFetcher';
import { generateSpecificRandomTransactions } from './nftAdmin.helper';
import { prepareConfigs } from './utils';

@Injectable()
export class NftAdminService {
	private readonly logger = new Logger(NftAdminService.name);

	constructor(
		@InjectRepository(Dao) private readonly daoRepository: Repository<Dao>,
		private readonly cacheService: CacheService,
		private readonly contractService: ContractService,
		private readonly collectionsService: CollectionsService,
		private readonly tierConfigService: TierConfigService,
		private readonly ipfsService: IpfsMetadataService,
		private readonly userService: UserService,
		private readonly daoMembershipService: DaoMembershipService,
		private readonly socketService: SocketService,
		private readonly transactionBrokerService: TransactionBrokerService
	) {}

	async getCollection(daoAddress: string): Promise<NftAdminCollectionResponse | undefined> {
		const cacheData = await this.cacheService.getAndUpdate(getNftAdminServiceCollectionKey(daoAddress), async () => {
			const collection = await this._getCollection(daoAddress);

			return collection ? JSON.stringify(collection) : '';
		});

		return (cacheData ? JSON.parse(cacheData) : undefined) as NftAdminCollectionResponse | undefined;
	}

	private async _getCollection(daoAddress: string): Promise<NftAdminCollectionResponse | undefined> {
		try {
			const erc721Helper = this.contractService.getERC721Helper();
			const erc721Properties = await erc721Helper.getContractByDaoAddress(daoAddress);
			const [name, symbol, baseURI, erc721semver, collectionAddress] = await Promise.all([
				erc721Properties.name(),
				erc721Properties.symbol(),
				erc721Properties.baseURI(),
				erc721Properties.__semver(),
				this.contractService.getCollectionAddress(daoAddress)
			]);

			const metadataFetcher = new MetadataFetcher(baseURI);
			const metadata = await metadataFetcher.getCollectionMetadata();
			const rawTiers = await erc721Helper.getTiersWithAttributes(erc721Properties, metadata.tiers, [
				{ name: TIER_ATTRIBUTES.NAME, type: 'string' },
				{ name: TIER_ATTRIBUTES.TIER_RANDOM_SHUFFLE_MINT, type: 'boolean' },
				{ name: TIER_ATTRIBUTES.IS_TRANSFERABLE, type: 'boolean' },
				{ name: TIER_ATTRIBUTES.TRANSFER_UNLOCKS_AT_HOURS, type: 'number' },
				{ name: TIER_ATTRIBUTES.MAX_AMOUNT, type: 'number' },
				{ name: TIER_ATTRIBUTES.TOTAL_AMOUNT, type: 'number' },
				{ name: TIER_ATTRIBUTES.TIER_RANDOM_MINT, type: 'boolean' },
				{ name: TIER_ATTRIBUTES.DEACTIVATED, type: 'boolean' }
			]);

			const tiers: NftAdminCollectionResponse['tiers'] = await Promise.all(
				Object.entries(rawTiers).map(async ([id, data]) => {
					const isRandom = Boolean(data.TIER_RANDOM_MINT);

					const hasRandomShuffleMint = Boolean(data.TIER_RANDOM_SHUFFLE_MINT);

					const isRandomArtworkType = isRandom || hasRandomShuffleMint;

					const base = {
						id,
						tierName: String(data.NAME),
						isRandom: Boolean(data.TIER_RANDOM_MINT),
						hasRandomShuffleMint: Boolean(data.TIER_RANDOM_SHUFFLE_MINT),
						isTransferable: Boolean(data.IS_TRANSFERABLE),
						transferUnlockDate: Math.floor(
							ethers.BigNumber.from(data.TRANSFER_UNLOCKS_AT_HOURS).toNumber() * 3_600_000
						),
						isDeactivated: Boolean(data.DEACTIVATED),
						tierArtworkType: isRandomArtworkType ? TierArtworkTypeStrings.random : TierArtworkTypeStrings.one,
						maxAmount: Number(data.MAX_AMOUNT),
						totalAmount: Number(data.TOTAL_AMOUNT)
					};

					const tierHelperData: TierHelperData = {
						id,
						tierArtworkType: base.tierArtworkType,
						maxAmount: Number(base.maxAmount),
						hasRandomShuffleMint: Boolean(data.TIER_RANDOM_SHUFFLE_MINT)
					};
					const metadata = await erc721Helper.getTierMetadata(tierHelperData, metadataFetcher);

					const firstSuitable = metadata.artworks.find((art) => art.attributes);
					const attributes = processAttributesBeforeFrontend(firstSuitable?.attributes || []);
					const { achievements, benefits, customProperties } = sortAttributesByPurpose(attributes, true);

					const tokenSaleAddress = await this.contractService.getOpenSaleTokenAddress(daoAddress);

					const currency = getTokenSymbolByAddress(tokenSaleAddress) || '';

					this.logger.log(`Tier ${id} token: ${JSON.stringify({ tokenSaleAddress, currency })}`);

					const totalPrice = await this.contractService.getTierSalesPrices(daoAddress, id ?? data.NAME);

					const salesActivity = await this.contractService.getTierSalesActivity(daoAddress, id ?? data.NAME);

					return {
						...base,
						...metadata,

						achievements,
						benefits,
						customProperties,

						totalPrice,
						currency,
						salesActivity
					};
				})
			);

			const tierConfigsFromDB = await this.tierConfigService.getTierConfigListByCollection(collectionAddress || '');

			const { orderedConfigs } = prepareConfigs({
				tiers,
				configs: tierConfigsFromDB,
				daoAddress,
				collectionAddress
			});

			const sellerFeeBasisPoints = isFinite(metadata.seller_fee_basis_points)
				? metadata.seller_fee_basis_points / 100
				: 0;

			return {
				name,
				collectionAddress,
				symbol,
				tierConfigs: orderedConfigs || [],
				tiers,
				sellerFeeBasisPoints,
				description: metadata.description,
				externalLink: metadata.external_link,
				feeRecipient: metadata.fee_recipient,
				erc721semver
			};
		} catch (error: any) {
			this.logger.error(`Can't get collection data for dao ${daoAddress}`, {
				message: error.message,
				stack: error.stack
			});
		}
	}

	async updateCollectionTx(
		daoAddress: string,
		data: NftAdminUpdateCollectionTxInput
	): Promise<PopulatedTransaction | undefined> {
		this.logger.log(`[NftAdmin.updateCollection] updating collection for DAO ${daoAddress}`, { data });

		try {
			const { tiers, name, symbol, description, externalLink, sellerFeeBasisPoints, feeRecipient } = data;

			const erc721Base = await this.contractService.getERC721Helper();
			const erc721Contract = await erc721Base.getContractByDaoAddress(daoAddress);
			const [baseURI, oldName, oldSymbol] = await Promise.all([
				erc721Contract.baseURI(),
				erc721Contract.name(),
				erc721Contract.symbol()
			]);
			const cid = baseURI.replace('ipfs://', '').replace('/', '');
			const contractMetadata = feeRecipient
				? { fee_recipient: feeRecipient }
				: await this.ipfsService.getCollectionMetadata(cid);

			const transactions: PopulatedTransaction[] = [];
			const descriptions: string[] = [];

			const newCid = await this.ipfsService.pushMetadata(
				{
					name,
					description,
					external_link: externalLink,
					seller_fee_basis_points: Math.floor(sellerFeeBasisPoints * 100),
					fee_recipient: contractMetadata.fee_recipient,
					tiers: tiers.map((tier) => tier.id)
				},
				tiers.map(encodeTierData)
			);

			if (newCid !== cid && newCid !== '') {
				const tx = await erc721Contract.populateTransaction.setBaseURI(`ipfs://${newCid}/`);
				transactions.push(tx);
				descriptions.push('Update baseURI');
			}

			if (name !== oldName) {
				const tx = await erc721Contract.populateTransaction.setName(name);
				transactions.push(tx);
				descriptions.push('Set name');
			}

			if (symbol !== oldSymbol) {
				const tx = await erc721Contract.populateTransaction.setSymbol(symbol);
				transactions.push(tx);
				descriptions.push('Set symbol');
			}

			for (const tier of tiers) {
				if (!tier.isDeactivated) {
					const [isTransferable, transferableUnlockDate, tierName] = await Promise.all([
						erc721Base.isTierTransferable(erc721Contract, tier.id),
						erc721Base.getTransferableUnlockDate(erc721Contract, tier.id),
						erc721Base.getTierName(erc721Contract, tier.id)
					]);

					if (tier.tierName !== tierName) {
						const tx = await erc721Base.setTierName(erc721Contract, tier.id, tier.tierName ?? tier.id);
						transactions.push(tx);
						descriptions.push('Set tier name');
					}

					if (tier.isTransferable !== isTransferable) {
						const tx = await erc721Base.setTierTransferable(erc721Contract, tier.id, tier.isTransferable);
						transactions.push(tx);
						descriptions.push('Set tier transferability');
					}

					if (
						Math.floor(new Date(tier.transferUnlockDate).getTime() / 1000 / 60 / 60) !==
						Math.floor(transferableUnlockDate.getTime() / 1000 / 60 / 60)
					) {
						const tx = await erc721Base.setTransferableUnlockDate(
							erc721Contract,
							tier.id,
							new Date(tier.transferUnlockDate)
						);
						transactions.push(tx);
						descriptions.push('Set transfer unlock date');
					}

					const { transactions: txs = [], descriptions: texts = [] } = await generateSpecificRandomTransactions({
						erc721Base,
						erc721Contract,
						tier
					});

					transactions.push(...txs);
					descriptions.push(...texts);
				}
			}

			const currentCollection = await this.collectionsService.getCollection(daoAddress);
			if (currentCollection?.tiers) {
				const tx = await erc721Base.removeTiers(erc721Contract, tiers, currentCollection.tiers);
				if (tx?.length) {
					transactions.push(...tx);
					descriptions.push('Removing some tiers');
				}
			}

			await this.tierConfigService.updateTierConfigList(data.tierConfigs);

			const admin = await this.contractService.getAdminContract(daoAddress);
			const tx = await admin.populateTransaction.batchCall(
				transactions.map((t) => t.to!),
				transactions.map((t) => ethers.utils.arrayify(t.data!))
			);

			if (!tx) throw new Error('[NftAdmin.updateCollection] Can`t create transaction for updating - no changes');

			this.logger.log(`[NftAdmin.updateCollection] update collection: ${descriptions.join(', ')}`);

			return { ...tx, from: undefined };
		} catch (error: any) {
			this.logger.error({
				message: error?.message ?? `Has error: updateCollection() in ${daoAddress}`,
				stack: error?.stack
			});
		}
	}

	async updateCollection(data: NftAdminUpdateCollectionInput, currentUserId: string): Promise<boolean> {
		const { transactionHash, daoAddress } = data;

		const dao = await this.daoRepository.findOneBy({ contractAddress: daoAddress });

		if (!dao) throw new NotFoundError();

		await this.daoMembershipService.checkAccess(currentUserId, dao.id, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);

		const user = await this.userService.findByIdOrSlug(currentUserId);
		if (!user) throw new NotFoundError();

		const msgData: NftAdminUpdateCollectionMessage['data'] = {
			transactionHash,
			daoId: dao.id,
			daoAddress,
			userToNotify: user.id
		};

		this.transactionBrokerService.trackNftAdminUpdateCollectionTransaction(msgData);

		return true;
	}

	async updateCollectionSuccess(data: MessageData['NFT_ADMIN_UPDATE_COLLECTION']): Promise<void> {
		const { daoId, daoAddress, userToNotify } = data;

		await this.cacheService.del(getNftAdminServiceCollectionKey(daoAddress));
		await this.cacheService.del(getCollectionsKey(daoAddress));
		await this.cacheService.del(getCollectionTierKey(daoAddress, '*').key);
		await this.cacheService.del(getCollectionArtworksKey(daoAddress, '*').key);
		await this.cacheService.del(getOpenSaleTokenAddressKey(daoAddress));
		await this.cacheService.del(getTierSalesPricesKey(daoAddress, '*').key);

		this.socketService.sendPrivateMessage(userToNotify, MessageName.NFT_ADMIN_UPDATE_COLLECTION_SUCCESS, {
			daoAddress,
			daoId
		});
	}

	async updateCollectionFail(data: MessageData['NFT_ADMIN_UPDATE_COLLECTION']): Promise<void> {
		const { daoId, userToNotify, daoAddress } = data;

		this.socketService.sendPrivateMessage(userToNotify, MessageName.NFT_ADMIN_UPDATE_COLLECTION_FAILED, {
			daoAddress,
			daoId
		});
	}

	async setupSaleTx(
		daoAddress: string,
		type: SaleType,
		options: SaleConfig
	): Promise<PopulatedTransaction | undefined> {
		const isOpenSale = type === SaleType.Public;

		try {
			this.logger.log(`Start setting up ${type} sale for ${daoAddress} with options: ${JSON.stringify(options)}`);

			const salesController = await this.contractService.getSalesControllerContract(daoAddress);

			this.logger.log(`Sales controller address: ${salesController?.address}`);

			const claimLimit = options.claimLimit;
			const totalClaimsLimit = options.totalClaimsLimit;
			const timeStart = options.timeStart;
			const timeEnd = options.timeEnd;
			const isActive = options.isActive;
			const tierValues = options.prices.map((tier) => ethers.utils.formatBytes32String(tier?.id ?? tier?.name));
			const tierPrices = options.prices.map((tier) => ethers.utils.parseEther(tier?.price?.toString() ?? '0'));
			const tierLimits = options.prices.map((tier) => tier.tierLimits);
			const tierActivity = options.prices.map((tier) => tier.active);

			let saleOptionValues;
			let saleOptions;

			if (isOpenSale) {
				const tokenSaleAddress = AVAILABLE_TOKENS_LIST.includes(options.token.toUpperCase())
					? options.token
					: POLYGON_ADDRESS_MAP.MATIC.address;

				saleOptionValues = [
					claimLimit,
					totalClaimsLimit,
					timeStart,
					timeEnd,
					isActive,
					tokenSaleAddress,
					tierValues,
					tierPrices,
					tierLimits,
					tierActivity
				];

				saleOptions = ethers.utils.AbiCoder.prototype.encode(
					['tuple(uint64, uint64, uint256, uint256, bool, address, bytes32[], uint256[], uint256[], bool[])'],
					[saleOptionValues]
				);
			} else {
				const merkleTreeRoot = ethers.utils.formatBytes32String(''); // possible to define merkle
				const merkleTreeIPFSHash = ethers.utils.formatBytes32String(''); // deprecated unused variable on wl sale contract

				saleOptionValues = [
					claimLimit,
					totalClaimsLimit,
					timeStart,
					timeEnd,
					isActive,
					merkleTreeRoot,
					merkleTreeIPFSHash,
					tierValues,
					tierPrices,
					tierLimits,
					tierActivity
				];

				saleOptions = ethers.utils.AbiCoder.prototype.encode(
					['tuple(uint64, uint64, uint256, uint256, bool, bytes32, bytes, bytes32[], uint256[], uint256[], bool[])'],
					[saleOptionValues]
				);
			}

			this.logger.log(`${type} sale option values: ${saleOptionValues}. Abi coded options: ${saleOptions}`);

			const deploySaleTx = await salesController?.populateTransaction?.deploySale(saleOptions, isOpenSale ? 1 : 2);

			if (deploySaleTx) {
				const admin = await this.contractService.getAdminContract(daoAddress);

				const tx = await admin?.populateTransaction.call(deploySaleTx.to!, ethers.utils.arrayify(deploySaleTx.data!));

				return { ...tx, from: undefined };
			} else {
				this.logger.error(`Can't populate new transaction body for ${type} sale setup. DAO kernel: ${daoAddress}`);
			}
		} catch (error: any) {
			this.logger.error('setupSaleTx() error: ', { message: error.message, stack: error.stack });
		}
	}

	async updateSaleTx(
		daoAddress: string,
		type: SaleType,
		options: SaleConfig
	): Promise<PopulatedTransaction | undefined> {
		const transactions: PopulatedTransaction[] = [];

		const txDescriptions: string[] = [];

		const isPublicSale = type === SaleType.Public;

		try {
			const saleTypeIndex = isPublicSale ? SaleTypeIndex.public : SaleTypeIndex.private;

			const salesController = await this.contractService.getSalesControllerContract(daoAddress);

			const sales = await salesController?.getAllSales();

			const saleAppAddress = sales ? sales?.find((sale) => sale.saleType === saleTypeIndex)?.app : undefined;

			this.logger.log(`Start updating ${type} sale for ${daoAddress}. saleAppAddress is: ${saleAppAddress}`);

			if (!saleAppAddress || saleAppAddress === ethers.constants.AddressZero) {
				this.logger.error(
					`Can't update ${type} sale for ${daoAddress} because saleAppAddress is zero. Trying to setup new sale.`
				);

				return this.setupSaleTx(daoAddress, type, options);
			}

			const saleInstance = await this.contractService.getSaleContractByType(type, daoAddress);

			this.logger.log(`Sale address: ${saleInstance?.address}`);

			const saleState = await saleInstance?.isActive();

			this.logger.log(`${type} sale for ${daoAddress} is ${saleState ? 'active' : 'inactive'}`);

			if (saleState !== options?.isActive) {
				const state = Boolean(options?.isActive);
				this.logger.log(`${state ? 'Activating' : 'Deactivating'} ${type} sale for ${daoAddress}`);
				const setSaleActiveTx = await saleInstance?.contract.populateTransaction.setActive(state);
				if (setSaleActiveTx) {
					transactions.push(setSaleActiveTx);
					txDescriptions.push(`Set sale state ${options?.isActive}`);
				}
			}

			if (options?.prices?.length) {
				this.logger.log(`Updating prices of ${type} sale for ${daoAddress}`);

				const tokenKey = (Object.entries(POLYGON_ADDRESS_MAP).find(
					([_, value]) => value.address === options.token
				)?.[0] || 'MATIC') as keyof typeof POLYGON_ADDRESS_MAP;

				const token = POLYGON_ADDRESS_MAP[tokenKey];

				const tiers = options.prices.map((x) =>
					ethers.utils.formatBytes32String(x?.id?.toUpperCase() ?? x?.name?.toUpperCase())
				);

				const tierPrices = options.prices.map((x) =>
					ethers.utils.parseUnits(x.price?.toString() ?? '0', token.decimals)
				);

				this.logger.log(
					`${type} sale payment policy config: ${JSON.stringify({ tokenKey, token, tiers, tierPrices })}`
				);

				const setSalePaymentPolicyTx = await saleInstance?.contract.populateTransaction.setPaymentPolicy(
					tiers,
					tierPrices
				);

				if (setSalePaymentPolicyTx) {
					transactions.push(setSalePaymentPolicyTx);
					txDescriptions.push(`Update sale payment policy`);
				}

				if (type === SaleType.Public) {
					const publicSale = saleInstance as OpenSaleContract;

					const currentTokenAddress = await publicSale.getTokenAddress();

					this.logger.log(`Public sale current token address: ${JSON.stringify({ currentTokenAddress })}`);
					this.logger.log(
						`Public sale new token address: ${JSON.stringify({
							newTokenAddress: token.address
						})}. `
					);

					if (currentTokenAddress?.toLowerCase() !== token.address.toLowerCase()) {
						const setTokenSaleAddressTx = await publicSale.contract.populateTransaction.setTokenSaleAddress(
							token.address
						);

						transactions.push(setTokenSaleAddressTx);
						txDescriptions.push(`Update sale token address`);
					}
				}

				const tierActivity = options.prices.map((tier) => Boolean(tier.active));

				const setSaleTiersActiveTx = await saleInstance?.contract.populateTransaction.setTiersActive(
					tiers,
					tierActivity
				);

				if (setSaleTiersActiveTx) {
					transactions.push(setSaleTiersActiveTx);
					txDescriptions.push(`Update tiers activity`);
				}
			}

			const isSaleTimeEditingActive = false; // TODO -> activate

			if (isSaleTimeEditingActive) {
				const saleTime = await saleInstance?.contract.getTime();

				this.logger.log(`Sale time raw: ${JSON.stringify(saleTime)}`);
				this.logger.log(
					`Sale time decoded: ${JSON.stringify({
						timeStart: new Date(saleTime?.[0]?.toNumber() ?? ''),
						timeEnd: new Date(saleTime?.[1]?.toNumber() ?? '')
					})}`
				);

				const isTimeStartUpdated = !saleTime?.[0]?.eq(ethers.BigNumber.from(options?.timeStart)); // && options?.timeStart !== 0

				const isTimeEndUpdated = !saleTime?.[1]?.eq(ethers.BigNumber.from(options?.timeEnd)); // && options?.timeEnd !== 0

				this.logger.log(`Time updating values: ${JSON.stringify({ isTimeStartUpdated, isTimeEndUpdated })}`);

				if (isTimeStartUpdated || isTimeEndUpdated) {
					const setSaleTimeTx = await saleInstance?.contract.populateTransaction.setTimeOfSale(
						options?.timeStart,
						options?.timeEnd
					);

					if (setSaleTimeTx) {
						transactions.push(setSaleTimeTx);
						txDescriptions.push('Set sale time');
					}
				}
			}

			const updatesTx = await salesController?.populateTransaction.executeBatch(
				transactions.map((tx) => tx.to!),
				transactions.map((tx) => tx.data!)
			);

			if (updatesTx) {
				this.logger.log(`Transactions [${txDescriptions.length}]: ${txDescriptions.join(',')}`);

				const admin = await this.contractService.getAdminContract(daoAddress);

				const tx = await admin.populateTransaction.call(updatesTx.to!, updatesTx.data!);

				return { ...tx, from: undefined };
			}
		} catch (error: any) {
			this.logger.error('_getEdiSaleTransaction error: ', { message: error.message, stack: error.stack });
		}
	}

	async processUpdateSale(data: NftAdminUpdateSaleInput, currentUserId: string): Promise<boolean> {
		const { transactionHash, daoAddress, type } = data;

		const dao = await this.daoRepository.findOneBy({ contractAddress: daoAddress });
		if (!dao) throw new NotFoundError();

		await this.daoMembershipService.checkAccess(currentUserId, dao.id, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);

		const user = await this.userService.findByIdOrSlug(currentUserId);
		if (!user) throw new NotFoundError();

		const msgData: NftAdminUpdateSaleMessage['data'] = {
			transactionHash,
			daoId: dao.id,
			daoAddress,
			userToNotify: user.id,
			type
		};

		this.transactionBrokerService.trackNftAdminUpdateSaleTransaction(msgData);

		return true;
	}

	async updateSaleSuccess(data: MessageData['NFT_ADMIN_UPDATE_SALE']): Promise<void> {
		const { daoId, daoAddress, userToNotify } = data;

		await this.cacheService.del(getNftAdminServiceCollectionKey(daoAddress));
		await this.cacheService.del(getCollectionsKey(daoAddress));
		await this.cacheService.del(getCollectionTierKey(daoAddress, '*').key);
		await this.cacheService.del(getOpenSaleTokenAddressKey(daoAddress));
		await this.cacheService.del(getTierSalesPricesKey(daoAddress, '*').key);
		await this.cacheService.del(getIsOpenSaleActiveKey(daoAddress));
		await this.cacheService.del(getIsPrivateSaleActiveKey(daoAddress));

		this.socketService.sendPrivateMessage(userToNotify, MessageName.NFT_ADMIN_UPDATE_SALE_SUCCESS, {
			daoAddress,
			daoId
		});
	}

	async updateSaleFail(data: MessageData['NFT_ADMIN_UPDATE_SALE']): Promise<void> {
		const { daoId, userToNotify, daoAddress } = data;

		this.socketService.sendPrivateMessage(userToNotify, MessageName.NFT_ADMIN_UPDATE_SALE_FAILED, {
			daoAddress,
			daoId
		});
	}
}
