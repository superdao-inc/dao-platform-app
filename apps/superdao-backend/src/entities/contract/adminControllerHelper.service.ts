import { Injectable } from '@nestjs/common';
import { wallet } from 'src/blockchain/common';
import { AdminController, AdminController__factory, Kernel__factory } from 'src/typechain';
import { ContractHelper } from './contract.helper';
import { ethers } from 'ethers';

@Injectable()
export class AdminControllerHelperService extends ContractHelper {
	contractInterface: ethers.utils.Interface;

	constructor(kernelFactory: Kernel__factory) {
		super(kernelFactory, 'ADMIN');
		this.contractInterface = new ethers.utils.Interface(AdminController__factory.abi);
	}

	getContractByContractAddress(contractAddress: string): AdminController {
		return AdminController__factory.connect(contractAddress, wallet);
	}

	async getContractByDaoAddress(daoAddress: string) {
		const addr = await this.getContractAddress(daoAddress);
		if (!addr) {
			const errorMsg = `[AdminControllerContract] Can't get contract for daoAddress`;
			throw new Error(errorMsg);
		}

		const contract = this.getContractByContractAddress(addr);

		return contract;
	}
}
