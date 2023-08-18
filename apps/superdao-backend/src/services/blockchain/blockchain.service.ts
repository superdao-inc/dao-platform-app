import { Injectable } from '@nestjs/common';

// constants
import { DEPRECATED_DAOS } from 'src/services/blockchain/constants';

// utils

// types
import { TierArtworkResponse, TierResponse } from 'src/services/blockchain/collection/collection.types';

// internal services
import { BlockchainCollectionService } from './collection/collection.service';
import { BlockchainDaoService } from './dao/dao.service';
import { BlockchainMembershipService } from './membership/membership.service';
import { BlockchainTransactionService } from './transaction/transaction.service';
import { BlockchainTreasuryService } from './treasury/treasury.service';

@Injectable()
export class CompositeBlockchainService {
	constructor(
		private readonly blockchainTreasuryService: BlockchainTreasuryService,
		private readonly blockchainTransactionService: BlockchainTransactionService,
		private readonly blockchainDaoService: BlockchainDaoService,
		private readonly blockchainMembershipService: BlockchainMembershipService,
		private readonly blockchainCollectionService: BlockchainCollectionService
	) {}

	// treasury
	public getTreasuryWallet(daoAddress: string) {
		return this.blockchainTreasuryService.wallet({ daoAddress });
	}

	// transaction
	public checkTransactionStatus(transactionHash: string) {
		return this.blockchainTransactionService.checkTransactionStatus({ transactionHash });
	}

	//dao
	public getDeployDefaultDaoTx(adminAdresses: string[], openseaOwnerAddress: string, creatorAddress: string) {
		return this.blockchainDaoService.getDeployDefaultDaoTx({ adminAdresses, openseaOwnerAddress, creatorAddress });
	}

	public getDeployedByTxDaoAddress(txHash: string) {
		return this.blockchainDaoService.getDeployedByTxDaoAddress({ txHash });
	}

	//membership
	public async getDaosAdmins(daoAddresses: string[]) {
		return this.blockchainMembershipService.getDaosAdmins({ daoAddresses });
	}

	public async getDaosMembers(daoAddresses: string[]) {
		return this.blockchainMembershipService.getDaosMembers({ daoAddresses });
	}

	public async getCollectionArtworks(
		daoAddress: string,
		tierName: string,
		maxArtworks = 0
	): Promise<TierArtworkResponse> {
		if (DEPRECATED_DAOS.includes(daoAddress)) {
			return await this.blockchainCollectionService.getDeprecatedArtworks(daoAddress, tierName, maxArtworks);
		} else {
			return await this.blockchainCollectionService.getArtworks(daoAddress, tierName, maxArtworks);
		}
	}

	/**
	 * FIXME: must be deleted, owners must be fetched separately
	 * @deprecated
	 * @param daoAddress kernel address, ie: 0x9a2b4c9c9f9b8e5b4a6b3c9c9f9b8e5b4a6b3c9c
	 * @param tierId
	 */
	public async getCollectionTierWithOwners(daoAddress: string, tierId: string): Promise<TierResponse> {
		if (DEPRECATED_DAOS.includes(daoAddress)) {
			return await this.blockchainCollectionService.getDeprecatedCollectionTier(daoAddress, tierId);
		} else {
			return await this.blockchainCollectionService.getCollectionTierWithOwners(daoAddress, tierId);
		}
	}

	public async getCollectionTier(daoAddress: string, tierId: string): Promise<TierResponse> {
		if (DEPRECATED_DAOS.includes(daoAddress)) {
			return this.blockchainCollectionService.getDeprecatedCollectionTier(daoAddress, tierId);
		} else {
			return this.blockchainCollectionService.getCollectionTier(daoAddress, tierId);
		}
	}

	public async getCollection(daoAddress: string) {
		if (DEPRECATED_DAOS.includes(daoAddress)) {
			return await this.blockchainCollectionService.getDeprecatedCollection(daoAddress);
		} else {
			return await this.blockchainCollectionService.getCollection(daoAddress);
		}
	}
}
