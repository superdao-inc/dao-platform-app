import { Injectable, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { components as moralisComponents } from 'moralis/types/generated/web3Api';
import { HttpService } from '@nestjs/axios';
import { ChainId } from '@sd/superdao-shared';
import { components, operations } from 'src/services/nfts-provider/dto.generated';
import { featureToggles } from 'src/services/featureToggles';
import { MoralisService } from 'src/services/moralis';
import { NftsMapper } from 'src/services/nfts-provider/nfts.mapper';
import { NftInfo } from 'src/entities/walletNfts/walletNfts.model';

@Injectable()
export class NftsProviderService {
	private readonly logger = new Logger(NftsProviderService.name);
	constructor(private readonly httpService: HttpService) {}

	public static get isWalletNftsServiceEnabled() {
		return featureToggles.isEnabled('treasury_use_nfts_service');
	}

	async syncWallet({ address }: operations['SyncController_update']['requestBody']['content']['application/json']) {
		try {
			const response: AxiosResponse<components['schemas']['AddWalletDtoResponse']> =
				await this.httpService.axiosRef.post('/v1/sync', {
					address
				});

			return response;
		} catch (error) {
			this.logger.error('Error syncing wallet on nfts provider', {
				isWalletNftsEnabled: NftsProviderService.isWalletNftsServiceEnabled,
				requestBody: { address },
				error
			});
		}
	}

	async addWallet({
		chainId,
		address,
		ecosystem
	}: operations['WalletController_add']['requestBody']['content']['application/json']) {
		try {
			const response: AxiosResponse<components['schemas']['AddWalletDtoResponse']> =
				await this.httpService.axiosRef.post('/v1/wallets', {
					chainId,
					address,
					ecosystem
				});

			return response;
		} catch (error) {
			this.logger.error('Error adding new wallet to nfts provider', {
				isWalletNftsEnabled: NftsProviderService.isWalletNftsServiceEnabled,
				requestBody: { chainId, address, ecosystem },
				error
			});
		}
	}

	async removeWallet({ address }: operations['WalletController_remove']['requestBody']['content']['application/json']) {
		try {
			const response: AxiosResponse<components['schemas']['RemoveWalletDtoResponse']> =
				await this.httpService.axiosRef.delete('/v1/wallets', {
					data: { address }
				});

			return response;
		} catch (error) {
			this.logger.error('Error adding new wallet to nfts provider', {
				isWalletNftsEnabled: NftsProviderService.isWalletNftsServiceEnabled,
				requestBody: { address },
				error
			});
		}
	}

	async getNfts({
		take = 21,
		...params
	}: operations['NftController_fetchAll']['parameters']['query']): Promise<NftInfo[]> {
		try {
			if (!NftsProviderService.isWalletNftsServiceEnabled) {
				if (params.skip) {
					// Logic from TreasuryService.getTreasury, for morality, do not implement pagination since we go to each chain separately
					return [];
				}
				const moralisResponses = await Promise.all(
					params.addresses.map((address) => MoralisService.getNfts(ChainId.POLYGON_MAINNET, address))
				);
				const nfts = moralisResponses.flatMap((response) => response.result);

				return nfts
					.filter((nft): nft is moralisComponents['schemas']['nftOwner'] => Boolean(nft))
					.map(NftsMapper.mapMoralisNft);
			}

			const response: AxiosResponse<components['schemas']['GetNftsResponse']> = await this.httpService.axiosRef.get(
				'/v1/nfts',
				{
					params: { ...params, take }
				}
			);

			return response.data.nfts.map(NftsMapper.mapNftInfo);
		} catch (error) {
			this.logger.error('Error fetching nfts', {
				isWalletNftsEnabled: NftsProviderService.isWalletNftsServiceEnabled,
				requestParams: { take, ...params },
				error
			});

			return [];
		}
	}

	async changeNftsVisibility(nftsIds: string[], isPublic: boolean): Promise<boolean> {
		try {
			await this.httpService.axiosRef.patch('/v1/nfts/visibility', { nftsIds, isPublic });
			return true;
		} catch (error) {
			this.logger.error('Error changing nfts visibility', { nftsIds, isPublic, error });

			return false;
		}
	}
}
