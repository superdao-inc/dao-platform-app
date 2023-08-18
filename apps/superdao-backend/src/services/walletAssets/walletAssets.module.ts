import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WalletAssetsService } from './walletAssets.service';

@Module({
	providers: [WalletAssetsService],
	imports: [
		ConfigModule,
		HttpModule.registerAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				baseURL: configService.get<string>('walletAssets.baseUrl')
			})
		})
	],
	exports: [WalletAssetsService]
})
export class WalletAssetsModule {}
