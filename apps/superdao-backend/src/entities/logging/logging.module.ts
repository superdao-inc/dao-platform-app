import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TransactionsLoggingService } from './logging.service';

import { AirdropLog } from './models/airdropLog.model';
import { BanLog } from './models/banLog.model';
import { BuyNftLog } from './models/buyNftLog.model';
import { ClaimNftLog } from './models/claimNftLog.model';
import { RefferalClaimLog } from './models/referralClaimLog.model';
import { WhitelistLog } from './models/whitelistLog.model';

@Module({
	imports: [TypeOrmModule.forFeature([BanLog, AirdropLog, WhitelistLog, BuyNftLog, ClaimNftLog, RefferalClaimLog])],
	providers: [TransactionsLoggingService],
	exports: [TransactionsLoggingService]
})
export class TransactionsLoggingModule {}
