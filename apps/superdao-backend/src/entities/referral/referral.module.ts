import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from 'src/services/cache/cache.module';
import { EthersModule } from 'src/services/ethers/ethers.module';
import { ContractModule } from '../contract/contract.module';
import { ReferralLink } from './models/referralLink.model';

import { ReferralCampaign } from './models/referralCampaign.model';
import { ReferralResolver } from './referral.resolver';
import { ReferralService } from './referral.service';
import { ReferralMember } from './models/referralMember.model';
import { DaoModule } from '../dao/dao.module';
import { NftModule } from '../nft/nft.module';
import { TransactionBrokerModule } from 'src/services/messageBroker/transaction/transactionBroker.module';
import { TransactionsLoggingModule } from '../logging/logging.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([ReferralCampaign, ReferralLink, ReferralMember]),
		ContractModule,
		DaoModule,
		CacheModule,
		NftModule,
		EthersModule,
		TransactionBrokerModule,
		TransactionsLoggingModule
	],
	providers: [ReferralResolver, ReferralService],
	exports: [ReferralService]
})
export class ReferralModule {}
