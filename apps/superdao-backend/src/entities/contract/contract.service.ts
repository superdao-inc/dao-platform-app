import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { formatBytes32String } from 'ethers/lib/utils';
import {
	CacheService,
	getCollectionAddressKey,
	getIsOpenSaleActiveKey,
	getIsPrivateSaleActiveKey,
	getOpenSaleTokenAddressKey,
	getTierSalesPricesKey
} from 'src/services/cache';
import { ERC721PropertiesContract } from 'src/entities/contract/erc721PropertiesContract';
import { SalesControllerHelperService } from 'src/entities/contract/salesControllerHelper.service';
import { TierSalesActivity, TotalPrice } from 'src/entities/nft/nft.types';
import { Kernel__factory } from 'src/typechain';
import { PrivateSaleContract } from 'src/entities/contract/privateSaleContract';
import { OpenSaleHelperService } from './openSaleHelper.service';
import { PrivateSaleHelperService } from './privateSaleHelper.service';
import { ERC721HelperService } from './erc721Helper.service';
import { BuyNftOptions, BuyWhitelistNftOptions } from './types';
import { DaoMemberRole } from '../daoMembership/daoMembership.types';
import { AirdropParticipant } from '../nft/nft.types';
import { AdminControllerHelperService } from './adminControllerHelper.service';
import { UpdateManagerHelperService } from './updateManagerHelper.service';
import { resolveAirdropEns } from './utils';
import { SaleType, SaleTypeIndex } from '@sd/superdao-shared';

@Injectable()
export class ContractService {
	private readonly logger = new Logger(ContractService.name);

	constructor(
		private readonly cacheService: CacheService,
		private readonly erc721ContractHelper: ERC721HelperService,
		private readonly openSaleContractHelper: OpenSaleHelperService,
		private readonly privateSaleContractHelper: PrivateSaleHelperService,
		private readonly adminContract: AdminControllerHelperService,
		private readonly kernelFactory: Kernel__factory,
		private readonly updateManagerHelper: UpdateManagerHelperService,
		private readonly erc721PropertiesContract: ERC721PropertiesContract,
		private readonly salesControllerHelperService: SalesControllerHelperService
	) {}

	async getAdminContract(daoAddress: string) {
		return this.adminContract.getContractByDaoAddress(daoAddress);
	}

	getERC721Helper() {
		return this.erc721ContractHelper;
	}

	async getCollectionAddress(daoAddress: string) {
		const cacheData = await this.cacheService.getAndUpdate(getCollectionAddressKey(daoAddress), async () => {
			let collectionAddress: string | null = '';
			try {
				collectionAddress = await this.erc721ContractHelper.getContractAddress(daoAddress);
			} catch (e) {}

			return collectionAddress ? JSON.stringify(collectionAddress) : '';
		});

		return (cacheData ? JSON.parse(cacheData) : null) as string | null;
	}

	async getIsOpenSaleActive(daoAddress: string): Promise<boolean> {
		const cacheData = await this.cacheService.getAndUpdate(getIsOpenSaleActiveKey(daoAddress), async () => {
			this.logger.log(`Getting isOpenSaleActive for dao ${daoAddress}`);
			const isOpenSaleActive = await this.openSaleContractHelper.isSaleActive(daoAddress);
			return JSON.stringify(isOpenSaleActive);
		});

		return JSON.parse(cacheData) as boolean;
	}

	async getOpenSaleTokenAddress(daoAddress: string): Promise<string> {
		const address = await this.cacheService.getAndUpdate(getOpenSaleTokenAddressKey(daoAddress), async () => {
			const openSaleTokenAddress = await this.openSaleContractHelper.getTokenSaleAddress(daoAddress);

			return JSON.stringify(openSaleTokenAddress);
		});

		return JSON.parse(address) as string;
	}

	async getLeftClaimsCountForTier(daoAddress: string, userWalletAddress: string, tier: string) {
		this.logger.log(`Getting left claims for tier ${tier} for dao ${daoAddress}`);
		return this.openSaleContractHelper.getLeftClaimsCountForTier(daoAddress, userWalletAddress, tier);
	}

	async getAllowanceTx(daoAddress: string, options: BuyNftOptions) {
		this.logger.log(`Getting allowance tx for dao ${daoAddress}`, { options });
		const isOpenSaleActive = this.getIsOpenSaleActive(daoAddress);
		if (!isOpenSaleActive) {
			throw new Error(`getAllowanceTx: DAO with address ${daoAddress} doesn't support multicurrency payment`);
		}

		return this.openSaleContractHelper.getAllowanceTx(daoAddress, options);
	}

	async getBuyNftTx(daoAddress: string, options: BuyNftOptions) {
		this.logger.log(`Getting buy NFT tx for dao ${daoAddress}`, { options });
		const isOpenSaleActive = this.getIsOpenSaleActive(daoAddress);
		if (!isOpenSaleActive) {
			throw new Error(`getBuyNftTx: DAO with address ${daoAddress} doesn't support multicurrency payment`);
		}

		return this.openSaleContractHelper.getBuyNftTx(daoAddress, options);
	}

	async buyNftOpenSaleTx(daoAddress: string, options: BuyNftOptions) {
		this.logger.log(`Getting transaction for dao ${daoAddress}`, { options });
		const isOpenSaleActive = this.getIsOpenSaleActive(daoAddress);
		if (!isOpenSaleActive) {
			throw new Error(`buyNftOpenSaleTx: DAO with address ${daoAddress} doesn't support multicurrency payment`);
		}

		return this.openSaleContractHelper.getBuyNftTx(daoAddress, options);
	}

	async buyNftWhitelistSaleTx(daoAddress: string, options: BuyWhitelistNftOptions) {
		this.logger.log(`Getting transaction for dao ${daoAddress}`, { options });
		const isPrivateSaleActive = this.getIsPrivateSaleActive(daoAddress);
		if (!isPrivateSaleActive) {
			throw new Error(`buyNftWhitelistSaleTx: DAO with address ${daoAddress} whitelist sale is not active`);
		}

		return this.privateSaleContractHelper.getBuyNftTx(daoAddress, options);
	}

	async deleteNftTierTx(daoAddress: string, erc721CollectionAddress: string, tier: string) {
		// TODO: check there is no more owners with that NFT, now we only check totalAmount on client side
		const tx = await this.erc721ContractHelper.deleteNftTierTx(erc721CollectionAddress, tier);

		if (!tx.to || !tx.data) throw Error;

		const admin = await this.adminContract.getContractByDaoAddress(daoAddress);
		const adminTx = await admin.populateTransaction.batchCall([tx.to], [tx.data]);

		return { ...adminTx, from: undefined };
	}

	/**
	 * аирдроп на прямую без бч-апи
	 */
	async airdropTx(daoAddress: string, airdrop?: AirdropParticipant[]) {
		if (!airdrop) return undefined;
		const contract = await this.erc721PropertiesContract.getContractByDaoAddress(daoAddress);

		let airdropResolvedEns = [];
		try {
			airdropResolvedEns = await resolveAirdropEns(airdrop);
		} catch (e) {
			this.logger.error(e);
			throw e;
		}

		const txs = await Promise.all(
			airdropResolvedEns?.map((t) =>
				contract.populateTransaction.mint(t.walletAddress, formatBytes32String(t.tiers[0]))
			)
		);

		if (!txs.length) throw Error;

		return txs;
	}

	async mint(daoAddress: string, to: string, tier: string) {
		const contract = await this.erc721PropertiesContract.getContractByDaoAddress(daoAddress);

		const tx = await contract.populateTransaction.mint(to, formatBytes32String(tier));
		return tx;
	}

	async getERC721PropertiesAddress(daoAddress: string) {
		const contract = await this.erc721PropertiesContract.getContractByDaoAddress(daoAddress);

		return contract.address;
	}

	async getTreasuryWallet(daoAddress: string): Promise<string | null> {
		return this.erc721ContractHelper.getTreasuryWallet(daoAddress);
	}

	async grantMemberRoleTx(daoAddress: string, userWalletAddress: string, role: DaoMemberRole) {
		const contract = await this.adminContract.getContractByDaoAddress(daoAddress);

		let tx;
		if (role === DaoMemberRole.Admin) {
			tx = await contract.populateTransaction.addAdmin(userWalletAddress);
			return { ...tx, from: undefined };
		}

		if (role === DaoMemberRole.Creator) {
			tx = await contract.populateTransaction.setCreator(userWalletAddress);
			return { ...tx, from: undefined };
		}
	}

	async revokeMemberRoleTx(daoAddress: string, userWalletAddress: string, role: DaoMemberRole) {
		const contract = await this.adminContract.getContractByDaoAddress(daoAddress);

		let tx;
		if (role === DaoMemberRole.Admin) {
			tx = await contract.populateTransaction.removeAdmin(userWalletAddress);
			return { ...tx, from: undefined };
		}

		// You can't take the Creator completely, there is no such method, you can only install a new one right away
		// Therefore, when taking the Creator, we call setCreator with address zero
		if (role === DaoMemberRole.Creator) {
			tx = await contract.populateTransaction.setCreator(ethers.constants.AddressZero);
			return { ...tx, from: undefined };
		}
	}

	async getCreator(daoAddress: string) {
		const contract = await this.adminContract.getContractByDaoAddress(daoAddress);

		return contract.creator();
	}

	async batchCall(daoAddress: string, txs: ethers.PopulatedTransaction[]) {
		if (!txs?.length) throw Error;

		const admin = await this.adminContract.getContractByDaoAddress(daoAddress);
		const tx = await admin.populateTransaction.batchCall(
			txs.map((t) => t.to!),
			txs.map((t) => t.data!)
		);

		return tx;
	}

	async getIsPrivateSaleActive(daoAddress: string): Promise<boolean> {
		const cacheData = await this.cacheService.getAndUpdate(getIsPrivateSaleActiveKey(daoAddress), async () => {
			this.logger.log(`Getting private sale active status for dao ${daoAddress}`);
			const isPrivateSaleActive = await this.privateSaleContractHelper.isSaleActive(daoAddress);
			return JSON.stringify(isPrivateSaleActive);
		});

		return JSON.parse(cacheData) as boolean;
	}

	async getTierSalesPrices(daoAddress: string, tierIdOrName: string): Promise<TotalPrice> {
		const redisKeyFieldData = getTierSalesPricesKey(daoAddress, tierIdOrName);

		const tierSalesPrices = await this.cacheService.hgetAndUpdate(
			redisKeyFieldData.key,
			redisKeyFieldData.field,
			async () => {
				let openSalePrice = '0';
				try {
					const openSaleContract = await this.openSaleContractHelper.getContractByDaoAddress(daoAddress);
					if (openSaleContract) {
						const openSalePriceBigNum = await openSaleContract.getTierPriceInContractCurrency(tierIdOrName);
						openSalePrice = openSalePriceBigNum.toString();
					}
				} catch (error: any) {
					this.logger.error(`[MulticurrencyOpenSale] Error while fetching tier open sale prices`, {
						message: error.message,
						stack: error.stack,
						tierName: tierIdOrName
					});
				}

				let privateSalePrice = '0';
				try {
					const privateSaleContract = await this.privateSaleContractHelper.getContractByDaoAddress(daoAddress);
					if (privateSaleContract) {
						const privateSalePriceBigNum = await privateSaleContract.getTierPriceInContractCurrency(tierIdOrName);
						privateSalePrice = privateSalePriceBigNum.toString();
					}
				} catch (error: any) {
					this.logger.error(`[MulticurrencyOpenSale] Error while fetching tier private sale prices`, {
						message: error.message,
						stack: error.stack,
						tierName: tierIdOrName
					});
				}

				return JSON.stringify({
					openSale: openSalePrice,
					whitelistSale: privateSalePrice
				});
			}
		);

		return JSON.parse(tierSalesPrices) as TotalPrice;
	}

	async getSaleContractByType(type: SaleType, daoAddress: string) {
		try {
			return type === SaleType.Public
				? this.openSaleContractHelper.getContractByDaoAddress(daoAddress)
				: this.privateSaleContractHelper.getContractByDaoAddress(daoAddress);
		} catch (e) {
			return null;
		}
	}

	async getKernelContract(daoAddress: string) {
		return this.kernelFactory.attach(daoAddress);
	}

	getUpdateManagerContract() {
		return this.updateManagerHelper.getUpdateManagerContract();
	}

	getSalesControllerContract(daoAddress: string) {
		return this.salesControllerHelperService.getContractByDaoAddress(daoAddress);
	}

	async getTierSalesActivity(daoAddress: string, tierIdOrName: string): Promise<TierSalesActivity> {
		try {
			const openSaleContract = await this.openSaleContractHelper.getContractByDaoAddress(daoAddress);

			const whitelistSaleContract = await this.privateSaleContractHelper.getContractByDaoAddress(daoAddress);

			const [openSaleState, whitelistSaleState] = await Promise.all([
				openSaleContract?.getTierActivity(tierIdOrName),
				whitelistSaleContract?.getTierActivity(tierIdOrName)
			]);

			return { openSale: Boolean(openSaleState), whitelistSale: Boolean(whitelistSaleState) };
		} catch (e: any) {
			this.logger.error('getSalesActivity() error: ', { message: e?.message });
			return { openSale: false, whitelistSale: false };
		}
	}

	async saveWhitelistMerkleRoot(daoAddress: string, hexMerkleRoot: string): Promise<ethers.Transaction> {
		this.logger.log(`Set merkle root value ${hexMerkleRoot} for dao: ${daoAddress}`);

		const merkleRoot = hexMerkleRoot === '0x' ? ethers.constants.HashZero : hexMerkleRoot;

		try {
			const privateSaleContractAddress = await this.privateSaleContractHelper.getContractByDaoAddress(daoAddress);

			this.logger.log(`saveWhitelistMerkleRoot privateSaleContractAddress: ${privateSaleContractAddress?.address}`);

			if (!privateSaleContractAddress) {
				throw new Error(`Private sale address is not exist`);
			}

			const privateSaleContract = await this.privateSaleContractHelper.getContractByContractAddress(
				privateSaleContractAddress.address
			);

			const salesController = await this.getSalesControllerContract(daoAddress);

			const saveWhitelistMerkleRootTx = await privateSaleContract.populateTransaction.setMerkleTree(
				merkleRoot,
				ethers.utils.formatBytes32String('')
			);

			if (!saveWhitelistMerkleRootTx) {
				throw new Error(`saveWhitelistMerkleRoot: saveWhitelistMerkleRootTx is ${saveWhitelistMerkleRootTx}`);
			}

			const executeTx = await salesController?.populateTransaction.executeSingle(
				saveWhitelistMerkleRootTx.to!,
				saveWhitelistMerkleRootTx.data!
			);

			if (!executeTx) {
				throw new Error(`executeTx: executeTx is ${executeTx}`);
			}

			const admin = await this.getAdminContract(daoAddress);

			const tx = await admin.populateTransaction.call(executeTx.to!, executeTx.data!);

			this.logger.log(`Result tx: ${JSON.stringify(tx)}`);

			return { ...tx, from: undefined } as ethers.Transaction;
		} catch (error: any) {
			this.logger.error(`saveWhitelistMerkleRoot error:`, error);
			throw new Error(error);
		}
	}

	async getSalesFromSaleController(daoAddress: string) {
		const salesController = await this.getSalesControllerContract(daoAddress);

		const sales = await salesController?.getAllSales();

		this.logger.log(`Getting sales for dao ${daoAddress}: ${JSON.stringify(sales)}`);

		if (!sales?.length) {
			return {
				sales: {
					ERC721_OPEN_SALE: false,
					ERC721_WHITELIST_SALE: false
				}
			};
		}

		const ERC721_OPEN_SALE =
			sales?.find((sale) => sale.saleType === SaleTypeIndex.public)?.app ?? ethers.constants.AddressZero;

		const ERC721_WHITELIST_SALE =
			sales?.find((sale) => sale.saleType === SaleTypeIndex.private)?.app ?? ethers.constants.AddressZero;

		const isOpenSaleActive = await this.getIsOpenSaleActive(daoAddress);

		const isWhitelistSaleActive = await this.getIsPrivateSaleActive(daoAddress);

		return {
			sales: {
				ERC721_OPEN_SALE:
					typeof ERC721_OPEN_SALE === 'string' &&
					ERC721_OPEN_SALE.length &&
					ERC721_OPEN_SALE !== ethers.constants.AddressZero &&
					isOpenSaleActive,
				ERC721_WHITELIST_SALE:
					typeof ERC721_WHITELIST_SALE === 'string' &&
					ERC721_WHITELIST_SALE.length &&
					ERC721_WHITELIST_SALE !== ethers.constants.AddressZero &&
					isWhitelistSaleActive
			}
		};
	}

	async buyWhitelistSale(
		daoAddress: string,
		toAddress: string,
		tier: string,
		proof: string[]
	): Promise<ethers.Transaction> {
		const whitelistSaleContract = (await this.getSaleContractByType(
			SaleType.Private,
			daoAddress
		)) as PrivateSaleContract;

		const buyNftTx = await whitelistSaleContract?.contract.populateTransaction.buy(proof, tier, { value: 0 }); // TODO FIXME!!!

		if (!buyNftTx) {
			throw new Error(`saveWhitelistMerkleRoot: saveWhitelistMerkleRootTx is ${buyNftTx}`);
		}

		const salesController = await this.getSalesControllerContract(daoAddress);

		const executeTx = await salesController?.populateTransaction.executeSingle(buyNftTx.to!, buyNftTx.data!);

		if (!executeTx) {
			throw new Error(`buyWhitelistSale: executeTx is ${executeTx}`);
		}

		const admin = await this.getAdminContract(daoAddress);

		const tx = await admin.populateTransaction.call(executeTx.to!, executeTx.data!);

		this.logger.log(`Result tx: ${JSON.stringify(tx)}`);

		return { ...tx, from: toAddress } as ethers.Transaction;
	}
}
