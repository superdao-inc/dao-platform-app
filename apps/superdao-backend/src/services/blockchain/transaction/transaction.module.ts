import { Module } from '@nestjs/common';

import { BlockchainTransactionService } from './transaction.service';

@Module({
	providers: [BlockchainTransactionService],
	exports: [BlockchainTransactionService]
})
export class BlockchainTransactionModule {}
