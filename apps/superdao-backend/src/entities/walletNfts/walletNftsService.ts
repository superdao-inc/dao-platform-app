import { Injectable } from '@nestjs/common';
import { EcosystemType } from '@sd/superdao-shared';
import { NftInfo } from './walletNfts.model';
import { WalletService } from 'src/entities/wallet/wallet.service';
import { NftsProviderService } from 'src/services/nfts-provider/nfts-provider.service';

const defaultNftsPageSize = 100;

@Injectable()
export class WalletNftsService {
	constructor(private readonly walletService: WalletService, private readonly nftsProvider: NftsProviderService) {}

	public async getWalletNfts(walletId: string, chainId?: number | null): Promise<NftInfo[]> {
		const wallet = await this.walletService.findWalletByIdOrFail(walletId);
		const { ecosystem, address } = wallet;

		if (ecosystem !== EcosystemType.EVM) throw new Error(`EVM chains only supported`);

		return this.nftsProvider.getNfts({ addresses: [address], take: defaultNftsPageSize, ...(chainId && { chainId }) });
	}

	changeNftsVisibility(nfts: string[], isPublic: boolean): Promise<boolean> {
		return this.nftsProvider.changeNftsVisibility(nfts, isPublic);
	}
}
