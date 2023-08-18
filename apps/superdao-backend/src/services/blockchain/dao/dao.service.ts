import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';

import { DAOConstructor__factory } from 'src/typechain';
import { DAOConstructor, DeploymentSettingsStruct } from 'src/typechain/DAOConstructor';

import { config } from 'src/config';

import {
	defaultAdminSettings,
	defaultNftSettings,
	defaultOpenSaleSettings,
	defaultWhitelistSaleSettings
} from './dao.constants';
import { GetDeployDefaultDaoTxRequest, GetDeployedByTxDaoAddressRequest } from './dao.types';

import { wallet } from '../blockchain.constants';

const { daoConstructorProxy } = config.polygon;

@Injectable()
export class BlockchainDaoService {
	private readonly logger = new Logger(BlockchainDaoService.name);
	private daoConstructor: DAOConstructor;

	constructor() {
		this.daoConstructor = DAOConstructor__factory.connect(daoConstructorProxy, wallet);
	}

	async getDeployDefaultDaoTx(requestParams: GetDeployDefaultDaoTxRequest) {
		const { adminAdresses, creatorAddress, openseaOwnerAddress } = requestParams;

		const settings: DeploymentSettingsStruct = {
			adminSettings: {
				...defaultAdminSettings,
				admins: adminAdresses,
				creator: creatorAddress
			},
			nftSettings: {
				...defaultNftSettings,
				openseaOwner: openseaOwnerAddress
			},
			openSaleSettings: defaultOpenSaleSettings,
			whiteListSaleSettings: defaultWhitelistSaleSettings
		};

		const transaction = await this.daoConstructor.populateTransaction.deploy(
			[ethers.BigNumber.from(0)],
			settings,
			ethers.utils.hexZeroPad('0x00', 20)
		);

		return transaction;
	}

	async getDeployedByTxDaoAddress(requestParams: GetDeployedByTxDaoAddressRequest) {
		const { txHash } = requestParams;

		const receipt = await wallet.provider.waitForTransaction(txHash, 1);

		const daoCreationLogs = receipt.logs.find(
			(x) => x.address.toLowerCase() === this.daoConstructor.address.toLowerCase()
		);

		if (!daoCreationLogs) {
			this.logger.error('getDaoAddress / filteredLogs is missing ', {
				logs: receipt.logs,
				['this.daoConstructor.address']: this.daoConstructor.address
			});
			return null;
		}

		return this.daoConstructor.interface.parseLog(daoCreationLogs!).args.kernel.toLowerCase();
	}
}
