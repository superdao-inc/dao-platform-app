import { Injectable } from '@nestjs/common';
import { wallet } from 'src/blockchain/common';
import { ERC721Properties, ERC721Properties__factory, Kernel__factory } from 'src/typechain';
import { ContractHelper } from './contract.helper';

@Injectable()
export class ERC721PropertiesContract extends ContractHelper {
	constructor(kernelFactory: Kernel__factory) {
		super(kernelFactory, 'ERC721');
	}

	getContractByContractAddress(contractAddress: string): ERC721Properties {
		return ERC721Properties__factory.connect(contractAddress, wallet);
	}

	async getContractByDaoAddress(daoAddress: string) {
		const addr = await this.getContractAddress(daoAddress);
		if (!addr) {
			const errorMsg = `Can't get contract for daoAddress`;
			throw new Error(errorMsg);
		}

		const contract = this.getContractByContractAddress(addr);

		return contract;
	}
}
