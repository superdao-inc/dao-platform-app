import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { Repository } from 'typeorm';

import { getAddress } from '@sd/superdao-shared';

// errors
import { NotFoundError } from 'src/exceptions';

import { CovalentApi } from 'src/libs/covalentApi';
import { NftsProviderService } from 'src/services/nfts-provider/nfts-provider.service';
import { NftInfo } from 'src/entities/walletNfts/walletNfts.model';
import { DaoService } from 'src/entities/dao/dao.service';
import { Treasury } from 'src/entities/treasury/treasury.model';
import { WalletService } from 'src/entities/wallet/wallet.service';

import { Dao } from '../dao/dao.model';
import { Wallet } from '../wallet/wallet.model';
import { WalletTransactionService } from '../walletTransaction/walletTransaction.service';
import { TREASURY_RATING_TTL, TREASURY_UPDATE_KEY } from './constants';
import { TransactionsArgs } from './dto/transactions.dto';

interface NftsFilters {
	isPublic?: boolean;
	offset?: number;
}

@Injectable()
export class TreasuryService {
	private readonly logger = new Logger(TreasuryService.name);

	// const isTxsPaginatedEnabled = featureToggles.isEnabled('treasury_paginated_txs');
	constructor(
		@InjectRedis() private readonly redis: Redis,
		@InjectRepository(Dao) private daoRepository: Repository<Dao>,
		@Inject(forwardRef(() => WalletService)) private readonly walletService: WalletService,
		@Inject(forwardRef(() => NftsProviderService)) private readonly nftsProvider: NftsProviderService,
		@Inject(forwardRef(() => DaoService)) private readonly daoService: DaoService,
		@Inject(forwardRef(() => WalletTransactionService))
		private readonly walletTransactionService: WalletTransactionService
	) {}

	async getTreasuryMainWalletAddress(daoId: string) {
		const daoWallets = await this.walletService.getDaoWallets(daoId);
		const mainWalletAddress = daoWallets.find((wallet) => wallet.main)?.address;

		return mainWalletAddress ?? null;
	}

	async getTreasury(daoId: string): Promise<Treasury | null> {
		const dao = await this.daoService.getByIdWithWallets(daoId);
		if (!dao) throw new NotFoundError('Dao was not found');

		const treasury = new Treasury();
		treasury.dao = dao;

		return treasury;
	}

	async getNftsForAddresses(addresses: string[], filters: NftsFilters): Promise<NftInfo[]> {
		return await this.nftsProvider.getNfts({
			addresses,
			skip: filters.offset,
			take: 21,
			isPublic: filters.isPublic
		});
	}

	async getTreasuryValue(dao: Dao, covalentApi: CovalentApi): Promise<number> {
		const wallets = await this.walletService.getWalletsWithBalance(covalentApi, dao.id);
		return wallets.reduce((acc, wallet) => acc + wallet.valueUsd, 0);
	}

	// TODO: why it's here? should be dao's responsibility to update its field imo
	async updateDaosTreasuryValue(covalentApi: CovalentApi): Promise<boolean> {
		const treasuryUpdated = await this.redis.get(TREASURY_UPDATE_KEY);
		if (treasuryUpdated) return false;

		const daos = await this.daoRepository
			.createQueryBuilder('dao')
			.leftJoinAndSelect('dao.wallets', 'wallets')
			.getMany();

		for (const dao of daos) {
			try {
				dao.treasuryValue = await this.getTreasuryValue(dao, covalentApi);
				await dao.save();
			} catch (e) {
				this.logger.error('Error in TreasuryService.updateDaosTreasuryValue', e);
			}
		}

		await this.redis.set(TREASURY_UPDATE_KEY, TREASURY_UPDATE_KEY, 'EX', TREASURY_RATING_TTL);

		this.logger.log('Get treasury rating finished with success');

		return true;
	}

	async getTokensBalance(covalentApi: CovalentApi, daoId: string) {
		const wallets = await this.walletService.getDaoWallets(daoId);
		const walletAddresses = wallets
			.map((wallet) => getAddress(wallet.address))
			.filter((address): address is string => address !== null);

		return this.walletService.getTokensBalance(covalentApi, walletAddresses);
	}

	async getWalletsWithBalance(covalentApi: CovalentApi, daoId: string): Promise<Wallet[]> {
		return this.walletService.getWalletsWithBalance(covalentApi, daoId);
	}

	async getTransactions(covalentApi: CovalentApi, transactionArgs: TransactionsArgs) {
		const { daoId, limit, offset, chainId, ecosystem } = transactionArgs;
		const wallets = await this.walletService.getDaoWallets(daoId);
		if (wallets.length === 0) return [];

		const addresses = wallets.map((wallet) => wallet.address);

		return this.walletTransactionService.getWalletTransactions(covalentApi, {
			addresses,
			limit,
			offset,
			chainId,
			ecosystem
		});
	}
}
