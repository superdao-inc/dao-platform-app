import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletTransactionResolver } from 'src/entities/walletTransaction/walletTransaction.resolver';
import { Wallet } from 'src/entities/wallet/wallet.model';
import { WalletTransactionMeta } from 'src/entities/walletTransaction/models/walletTransactionMeta.model';
import { TransactionsProviderModule } from 'src/services/transactions-provider/transactions-provider.module';
import { WalletTransactionService } from 'src/entities/walletTransaction/walletTransaction.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
	imports: [
		TransactionsProviderModule,
		forwardRef(() => WalletModule),
		TypeOrmModule.forFeature([Wallet, WalletTransactionMeta])
	],
	providers: [WalletTransactionService, WalletTransactionResolver],
	exports: [WalletTransactionService]
})
export class WalletTransactionModule {}
