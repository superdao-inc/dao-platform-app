import { ethers } from 'ethers';

import { Kernel__factory } from 'src/typechain';

import { CONTRACT_NAME, wallet } from '../blockchain.constants';

import { GetAppAddressRequest } from './base.types';

export class BlockchainBaseService {
	contractName: CONTRACT_NAME;
	kernelFactory: Kernel__factory;

	constructor(contractName: CONTRACT_NAME) {
		this.kernelFactory = new Kernel__factory(wallet);
		this.contractName = contractName;
	}

	public async getAppAddress(requestParams: GetAppAddressRequest) {
		const { daoAddress } = requestParams;

		const kernel = this.kernelFactory.attach(daoAddress);
		const appAddress: string = await kernel.getAppAddress(
			ethers.utils.keccak256(ethers.utils.toUtf8Bytes(this.contractName))
		);

		return appAddress;
	}
}
