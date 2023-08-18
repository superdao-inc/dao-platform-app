import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { chainIds } from '@sd/superdao-shared';
import { components, operations } from './dto.generated';

@Injectable()
export class WalletAssetsService {
	private readonly logger = new Logger(WalletAssetsService.name);

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

	async scheduleSyncWallet(dto: Omit<components['schemas']['SyncWalletAssets'], 'type'>): Promise<void> {
		const { chainId } = dto;
		const chains = chainId ? [chainId] : chainIds;
		await Promise.all(
			chains.map(async (chain) => {
				try {
					await this.httpClient.axiosRef.post('/v1/sync/schedule', {
						address: dto.address,
						ecosystem: dto.ecosystem,
						type: 'assets',
						chainId: chain
					});
				} catch (e) {
					this.logger.error(
						`Error while syncing wallet in service. Wallet address ${dto.address} chainId ${dto.chainId}`,
						e
					);
				}
			})
		);
	}

	async getCmcAssets(
		dto: operations['CmcAssetController_fetch']['parameters']['query']
	): Promise<components['schemas']['CmcAssetEntity'][] | null> {
		try {
			const response = await this.httpClient.axiosRef.get('/v1/cmc-assets', {
				params: { ...dto, addresses: dto.addresses.join(',') }
			});
			if (!response.data) return null;
			return response.data;
		} catch (e) {
			this.logger.error(`Error while getting assets from service. Wallets addresses ${dto.addresses?.join(', ')}`, e);
			return null;
		}
	}

	async getCmcAssetsSummary(
		dto: operations['CmcAssetController_summary']['parameters']['query']
	): Promise<components['schemas']['CostModel'][] | null> {
		try {
			const response = await this.httpClient.axiosRef.get('/v1/cmc-assets/summary', {
				params: { ...dto, addresses: dto.addresses.join(',') }
			});
			if (!response.data) return null;
			return response.data;
		} catch (e) {
			this.logger.error(`Error while getting assets from service. Wallets addresses ${dto.addresses?.join(', ')}`, e);
			return null;
		}
	}
}
