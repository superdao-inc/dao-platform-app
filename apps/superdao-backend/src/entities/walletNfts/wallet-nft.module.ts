import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletNftsService } from 'src/entities/walletNfts/walletNftsService';
import { WalletNftsResolver } from 'src/entities/walletNfts/walletNfts.resolver';
import { WalletModule } from 'src/entities/wallet/wallet.module';
import { NftsProviderModule } from 'src/services/nfts-provider/nfts-provider.module';
import { Treasury } from '../treasury/treasury.model';
import { TreasuryModule } from '../treasury/treasury.module';
import { CollectionsModule } from 'src/entities/collections/collections.module';

@Module({
	imports: [WalletModule, NftsProviderModule, TypeOrmModule.forFeature([Treasury]), TreasuryModule, CollectionsModule],
	providers: [WalletNftsService, WalletNftsResolver],
	exports: [WalletNftsService]
})
export class WalletNftModule {}
