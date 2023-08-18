import { Module } from '@nestjs/common';
import { CoinMarketCapService } from 'src/services/coinMarketCap/coinMarketCap.service';

@Module({
	providers: [CoinMarketCapService],
	exports: [CoinMarketCapService]
})
export class CoinMarketCapModule {}
