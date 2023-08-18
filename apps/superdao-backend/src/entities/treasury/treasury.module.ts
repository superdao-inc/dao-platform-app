import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dao } from 'src/entities/dao/dao.model';
import { TreasuryService } from './treasury.service';
import { WalletModule } from 'src/entities/wallet/wallet.module';
import { TreasuryResolver } from 'src/entities/treasury/treasury.resolver';
import { ContractModule } from 'src/entities/contract/contract.module';
import { DaoModule } from 'src/entities/dao/dao.module';
import { NftsProviderModule } from 'src/services/nfts-provider/nfts-provider.module';
import { WalletTransactionModule } from '../walletTransaction/wallet-transaction.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Dao]),
		forwardRef(() => DaoModule),
		forwardRef(() => WalletModule),
		forwardRef(() => NftsProviderModule),
		forwardRef(() => ContractModule),
		forwardRef(() => WalletTransactionModule)
	],
	providers: [TreasuryService, TreasuryResolver],
	exports: [TreasuryService]
})
export class TreasuryModule {}
