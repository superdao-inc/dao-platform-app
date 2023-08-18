import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TransactionsProviderService } from './transactions-provider.service';

@Module({
	providers: [TransactionsProviderService],
	imports: [
		ConfigModule,
		HttpModule.registerAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				baseURL: configService.get<string>('walletTransactions.baseUrl')
			})
		})
	],
	exports: [TransactionsProviderService]
})
export class TransactionsProviderModule {}
