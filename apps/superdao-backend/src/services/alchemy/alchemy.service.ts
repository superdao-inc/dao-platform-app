import { ethers } from 'ethers';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TreasuryWalletType } from 'src/entities/wallet/wallet.model';

const EXTERNAL_WALLET_CODE = '0x';

@Injectable()
export class AlchemyService {
	provider: ethers.providers.AlchemyProvider;
	constructor(configService: ConfigService) {
		const apiKey = configService.get<string>('alchemy.apiKey') || 'demo';
		this.provider = new ethers.providers.AlchemyProvider('matic', apiKey);
	}

	async getAddressType(address: string): Promise<TreasuryWalletType | null> {
		try {
			const result = await this.provider.getCode(address);
			if (result === EXTERNAL_WALLET_CODE) {
				return TreasuryWalletType.EXTERNAL;
			}
			return TreasuryWalletType.SAFE;
		} catch (e) {
			return null;
		}
	}
}
