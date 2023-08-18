import { Module } from '@nestjs/common';
import { NftsProviderService } from 'src/services/nfts-provider/nfts-provider.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
	imports: [
		HttpModule.registerAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				baseURL: configService.get<string>('walletNftsService.baseUrl')
			})
		})
	],
	providers: [NftsProviderService],
	exports: [NftsProviderService]
})
export class NftsProviderModule {}
