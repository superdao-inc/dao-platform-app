import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { decodeTransaction } from 'src/libs/covalentApiDecoder';
import { WalletTransaction } from 'src/entities/walletTransaction/models/walletTransaction';
import { components, operations } from './dto.generated';
import { mapWalletTransaction } from './transactions-provider.mapper';
import { chainIds, EcosystemType } from '@sd/superdao-shared';

@Injectable()
export class TransactionsProviderService {
	private readonly logger = new Logger(TransactionsProviderService.name);

	constructor(private httpClient: HttpService) {
		this.httpClient = httpClient;
	}

	async addWallet(dto: components['schemas']['AddWalletDto']): Promise<boolean> {
		try {
			const response = await this.httpClient.axiosRef.post('/v1/wallets', dto);
			if (!response.data) return false;

			return true;
		} catch (e) {
			this.logger.error(`Error while adding wallet to service. Wallet address ${dto.address}`, e);
			return false;
		}
	}

	async removeWallet(dto: components['schemas']['RemoveWalletDto']): Promise<boolean> {
		try {
			const response = await this.httpClient.axiosRef.delete('/v1/wallets', { params: dto });
			if (!response.data) return false;

			return true;
		} catch (e) {
			this.logger.error(`Error while removing wallet from service. Wallet address ${dto.address}`, e);
			return false;
		}
	}

	async syncWallet(dto: Omit<components['schemas']['SyncWalletTransactionsDto'], 'chainId'>): Promise<void> {
		await Promise.all(
			chainIds.map(async (chain) => {
				try {
					await this.httpClient.axiosRef.post('/v1/sync', {
						address: dto.address,
						ecosystem: dto.ecosystem,
						type: 'transactions',
						chainId: chain
					});
				} catch (e) {
					this.logger.error(`Error while syncing wallet in service. Wallet address ${dto.address} chainId ${chain}`, e);
				}
			})
		);
	}

	async getTransactions(
		dto: operations['TransactionController_getTransactions']['parameters']['query']
	): Promise<WalletTransaction[]> {
		try {
			const response = await this.httpClient.axiosRef.get<components['schemas']['GetTransactionsResponse']>(
				'/v3/transactions',
				{
					params: { ...dto, chainIds: dto.chainIds.join(',') }
				}
			);
			if (!response.data || !response.data.items) return [];
			return response.data.items.map(mapWalletTransaction).map((item) => {
				return decodeTransaction(item, {
					ecosystem: EcosystemType.EVM,
					walletAddress: item.walletAddress,
					chainId: item.chainId
				});
			});
		} catch (e) {
			this.logger.error(
				`Error while getting transactions from service. Wallets addresses ${dto.addresses.join(',')}`,
				e
			);
			return [];
		}
	}
}
