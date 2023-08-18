import { Injectable } from '@nestjs/common';
import { wallet } from 'src/blockchain/common';
import { SalesController, SalesController__factory, Kernel__factory } from 'src/typechain';
import { ContractHelper } from './contract.helper';
import { SaleTypeIndex } from '@sd/superdao-shared';

const SALES_CONTROLLER_APP_ID = 'SALES_CONTROLLER';

@Injectable()
export class SalesControllerHelperService extends ContractHelper {
	constructor(kernelFactory: Kernel__factory) {
		super(kernelFactory, SALES_CONTROLLER_APP_ID);
	}

	getContractByContractAddress(contractAddress: string): SalesController {
		return SalesController__factory.connect(contractAddress, wallet);
	}

	async getContractByDaoAddress(daoAddress: string): Promise<SalesController | null> {
		try {
			const address = await this.getContractAddress(daoAddress);

			if (!address) {
				throw new Error(`[SalesControllerHelperService] Can't get contract for daoAddress`);
			}

			return this.getContractByContractAddress(address);
		} catch (e) {
			return null;
		}
	}

	async getSaleAddress(daoAddress: string, type: SaleTypeIndex): Promise<string | undefined> {
		const salesController = await this.getContractByDaoAddress(daoAddress);

		const sales = await salesController?.getAllSales();

		return sales ? sales?.find((sale) => sale.saleType === type)?.app : undefined;
	}
}
