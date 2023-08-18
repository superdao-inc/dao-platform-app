import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dao } from 'src/entities/dao/dao.model';
import { Wallet } from 'src/entities/wallet/wallet.model';
import { WalletTransactionModule } from 'src/entities/walletTransaction/wallet-transaction.module';
import { NftsProviderModule } from 'src/services/nfts-provider/nfts-provider.module';
import { TransactionsProviderModule } from 'src/services/transactions-provider/transactions-provider.module';
import { WalletAssetsModule } from 'src/services/walletAssets/walletAssets.module';
import { DaoModule } from '../dao/dao.module';
import { UserModule } from '../user/user.module';
import { WalletResolver } from './wallet.resolver';
import { WalletService } from './wallet.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Wallet, Dao]),
		forwardRef(() => DaoModule),
		forwardRef(() => WalletTransactionModule),
		forwardRef(() => NftsProviderModule),
		forwardRef(() => WalletAssetsModule),
		forwardRef(() => TransactionsProviderModule),
		forwardRef(() => UserModule)
	],
	providers: [WalletService, WalletResolver],
	exports: [WalletService]
})
export class WalletModule {}
