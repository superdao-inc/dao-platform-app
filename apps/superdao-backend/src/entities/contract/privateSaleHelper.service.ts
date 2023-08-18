import { Injectable } from '@nestjs/common';
import { wallet } from 'src/blockchain/common';
import { PrivateSaleContract } from 'src/entities/contract/privateSaleContract';
import { ERC721WhitelistSale, ERC721WhitelistSale__factory, Kernel__factory } from 'src/typechain';
import { SalesControllerHelperService } from 'src/entities/contract/salesControllerHelper.service';
import { BuyWhitelistNftOptions } from 'src/entities/contract/types';
import { ContractHelper } from './contract.helper';
import { SaleTypeIndex } from '@sd/superdao-shared';

const WHITELIST_SALE_APP_ID = 'ERC721_WHITELIST_SALE';

@Injectable()
export class PrivateSaleHelperService extends ContractHelper {
	constructor(
		kernelFactory: Kernel__factory,
		private readonly salesControllerHelperService: SalesControllerHelperService
	) {
		super(kernelFactory, WHITELIST_SALE_APP_ID);
	}

	getContractByContractAddress(contractAddress: string): ERC721WhitelistSale {
		return ERC721WhitelistSale__factory.connect(contractAddress, wallet);
	}

	async getContractByDaoAddress(daoAddress: string): Promise<PrivateSaleContract | null> {
		try {
			const address = await this.salesControllerHelperService.getSaleAddress(daoAddress, SaleTypeIndex.private);

			if (!address) {
				throw new Error(`[PrivateSaleContractHelper] Can't get contract for daoAddress`);
			}

			const contract = this.getContractByContractAddress(address);

			return new PrivateSaleContract(contract, address);
		} catch (e) {
			return null;
		}
	}

	async getSaleAddress(daoAddress: string): Promise<string | undefined> {
		try {
			const contract = await this.getContractByDaoAddress(daoAddress);

			return contract?.address ?? undefined;
		} catch (e) {
			return undefined;
		}
	}

	async isSaleActive(daoAddress: string): Promise<boolean> {
		const contract = await this.getContractByDaoAddress(daoAddress);

		return contract?.isActive() ?? false;
	}

	async getBuyNftTx(daoAddress: string, options: BuyWhitelistNftOptions) {
		const contract = await this.getContractByDaoAddress(daoAddress);

		return contract?.getBuyNftTx(options);
	}
}
