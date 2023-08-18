import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { BlockchainHttpModule } from 'src/entities/blockchain/blockchain-http.module';
import { BloackchainService } from './blockchain.service';

@Module({
	imports: [
		BlockchainHttpModule.registerAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				baseURL: configService.get<string>('urls.blockchainServicesUrl')
			})
		})
	],
	providers: [BloackchainService],
	exports: [HttpModule, BloackchainService]
})
export class BlockchainModule {}
