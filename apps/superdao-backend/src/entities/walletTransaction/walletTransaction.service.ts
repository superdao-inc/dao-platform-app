import { In, Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import type { WalletTransaction } from './models/walletTransaction';
import { WalletTransactionMeta } from './models/walletTransactionMeta.model';

import { CovalentApi } from 'src/libs/covalentApi';

import { WalletTransactionArgs } from './dto/walletTransaction.dto';
import { WalletTransactionsArgs } from './dto/walletTransactions.dto';
import { featureToggles } from 'src/services/featureToggles';
import { ChainId, chainIds, EcosystemType } from '@sd/superdao-shared';
import { TransactionsProviderService } from 'src/services/transactions-provider/transactions-provider.service';
import { WalletService } from '../wallet/wallet.service';
import { Wallet } from '../wallet/wallet.model';

export class WalletTransactionService {
	constructor(
		@InjectRepository(WalletTransactionMeta) private walletTransactionMetaRepository: Repository<WalletTransactionMeta>,
		private readonly transactionsProviderService: TransactionsProviderService,
		private readonly walletService: WalletService
	) {}

	async getWalletTransactions(
		covalentApi: CovalentApi,
		walletTransactionsArgs: WalletTransactionsArgs
	): Promise<WalletTransaction[]> {
		const transactions = await this.getTransactions(covalentApi, walletTransactionsArgs);

		const metas = await this.walletTransactionMetaRepository.find({
			where: {
				ecosystem: walletTransactionsArgs.ecosystem,
				chainId: In(walletTransactionsArgs.chainId ? [walletTransactionsArgs.chainId] : chainIds),
				hash: In(transactions.map((tx) => tx.hash))
			}
		});

		type byHashMap = Map<string, WalletTransactionMeta>;
		type byChainIdMap = Map<number | null, byHashMap>;
		type byEcosystemMap = Map<EcosystemType, byChainIdMap>;

		const txMetaMap: byEcosystemMap = metas.reduce((result, tx) => {
			const byEcosystem: byChainIdMap = result.get(tx.ecosystem) || new Map();
			const byChainId: byHashMap = byEcosystem.get(tx.chainId) || new Map();

			byChainId.set(tx.hash, tx);
			byEcosystem.set(tx.chainId, byChainId);
			result.set(tx.ecosystem, byEcosystem);

			return result;
		}, new Map());

		return transactions.map((tx) => {
			return {
				...tx,
				description: txMetaMap.get(tx.ecosystem)?.get(tx.chainId)?.get(tx.hash)?.description || null
			};
		});
	}

	async getTransactions(
		covalentApi: CovalentApi,
		walletTransactionsArgs: WalletTransactionsArgs
	): Promise<WalletTransaction[]> {
		const { ecosystem, chainId, addresses, offset = 0, limit: pageSize = 20 } = walletTransactionsArgs;

		const pageNumber = Math.floor(offset / pageSize);
		let transactions;
		if (featureToggles.isEnabled('treasury_use_wallet_transactions_service')) {
			transactions = await this.transactionsProviderService.getTransactions({
				ecosystem: ecosystem,
				chainIds: chainId ? [chainId] : [],
				addresses: addresses,
				pageSize,
				pageNumber
			});
		} else {
			const walletsTransactions = await Promise.all(
				addresses.map((address) =>
					covalentApi.getEvmTransactions(chainId || ChainId.POLYGON_MAINNET, address, {
						pageSize,
						pageNumber
					})
				)
			);
			transactions = walletsTransactions.flatMap((transactionList) => transactionList);
		}
		const wallets = (await this.walletService.getByAddresses(addresses)).reduce((acc, wallet) => {
			acc.set(wallet.address, wallet);
			return acc;
		}, new Map<string, Wallet>());
		return transactions.map((tx) => {
			if (tx.walletAddress) {
				const wallet = wallets.get(tx.walletAddress);
				if (wallet) {
					tx.walletName = wallet.name;
					tx.walletId = wallet.id;
				}
			}
			return tx;
		});
	}

	static async getWalletTransaction(
		covalentApi: CovalentApi,
		walletTransactionArgs: WalletTransactionArgs
	): Promise<WalletTransaction> {
		const transaction = await covalentApi.getTransaction(
			walletTransactionArgs.chainId || ChainId.POLYGON_MAINNET,
			walletTransactionArgs.address,
			walletTransactionArgs.hash
		);

		return transaction;
	}
}
