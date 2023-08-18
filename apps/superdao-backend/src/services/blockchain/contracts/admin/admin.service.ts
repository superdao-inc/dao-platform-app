import { Injectable } from '@nestjs/common';

import { AdminController__factory } from 'src/typechain';

import { CONTRACT_NAME, wallet } from '../../blockchain.constants';

import { BlockchainBaseService } from '../base.service';

import { GetAdminContractRequest } from './admin.types';

@Injectable()
export class BlockchainAdminContractService extends BlockchainBaseService {
	private adminControllerFactory: AdminController__factory;

	constructor() {
		super(CONTRACT_NAME.ADMIN);

		this.adminControllerFactory = new AdminController__factory(wallet);
	}

	public async getAdminContract(requestParams: GetAdminContractRequest) {
		const { adminAddress } = requestParams;

		const adminController = this.adminControllerFactory.attach(adminAddress);

		return adminController;
	}
}
