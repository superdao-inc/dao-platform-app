import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ethers } from 'ethers';
import toCamelCase from 'camelcase-keys';
import { ContractService } from 'src/entities/contract/contract.service';
import { NotFoundError } from 'src/exceptions';
import { CacheService, getUserNftsKey } from 'src/services/cache';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';

@Injectable()
export class TransactionService {
	private readonly logger = new Logger(TransactionService.name);

	constructor(
		private readonly cacheService: CacheService,
		private readonly contractService: ContractService,
		private readonly httpService: HttpService,
		private readonly userService: UserService
	) {}

	async buyNftMulticurrencyOpenSaleTx(
		walletAddr: string,
		user: User,
		daoAddress: string,
		tier: string,
		tokenAddress: string
	) {
		try {
			const tx = await this.contractService.getBuyNftTx(daoAddress, {
				tier,
				tokenAddress,
				userWalletAddress: walletAddr as string
			});

			this.logger.log(`[MulticurrencyOpenSale] Buy NFT tx: `, { tx });

			const GAS_LIMIT = 5_000_000;
			const changedTx = {
				...tx,
				from: walletAddr,
				gasLimit: {
					hex: ethers.BigNumber.from(GAS_LIMIT).toHexString(),
					type: 'BigNumber'
				},
				value: tx?.value
					? {
							hex: tx.value._hex,
							type: 'BigNumber'
					  }
					: undefined
			};

			this.logger.log(`[MulticurrencyOpenSale] Changed buy NFT tx: `, { changedTx });

			return changedTx;
		} catch (error) {
			this.logger.error(`[MulticurrencyOpenSale] Can't buy nft multicurrency`, {
				error,
				daoAddress,
				tier,
				userId: user?.id
			});

			throw error;
		}
	}

	async banMember(userId: string, daoAddress: string, tokenIds: string[]) {
		const user = await this.userService.findByIdOrSlug(userId);
		if (!user) throw new NotFoundError();

		const admin = await this.contractService.getAdminContract(daoAddress);
		const tx = await admin.populateTransaction.batchBurn(tokenIds);

		const redisKeyFieldData = getUserNftsKey(user.walletAddress, daoAddress);

		await this.cacheService.hdel(redisKeyFieldData.key, redisKeyFieldData.field);

		return toCamelCase({ ...tx, from: undefined }, { deep: true });
	}

	async createDao(name: string, symbol: string, adminAddresses: string[]) {
		const response = await this.httpService.axiosRef.post<{ transaction: ethers.Transaction }>('/daos/create', {
			name,
			symbol,
			admins: adminAddresses
		});

		return toCamelCase(response.data);
	}

	async saveWhitelistMerkleRoot(daoAddress: string, merkleRoot: string): Promise<ethers.Transaction> {
		return this.contractService.saveWhitelistMerkleRoot(daoAddress, merkleRoot);
	}

	async buyWhitelistSale(
		daoAddress: string,
		tier: string,
		proof: string[]
	): Promise<ethers.PopulatedTransaction | undefined> {
		return this.contractService.buyNftWhitelistSaleTx(daoAddress, { tier, proof });
	}
}
