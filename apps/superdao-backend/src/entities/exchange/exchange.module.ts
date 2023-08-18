import { Module } from '@nestjs/common';
import { ExchangeResolver } from 'src/entities/exchange/exchange.resolver';
import { CoinMarketCapModule } from 'src/services/coinMarketCap/coinMarketCap.module';
import { ExchangeService } from 'src/entities/exchange/exchange.service';

@Module({
	imports: [CoinMarketCapModule],
	providers: [ExchangeService, ExchangeResolver]
})
export class ExchangeModule {}
