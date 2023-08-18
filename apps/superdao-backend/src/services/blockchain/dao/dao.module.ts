import { Module } from '@nestjs/common';

import { BlockchainDaoService } from './dao.service';

@Module({
	providers: [BlockchainDaoService],
	exports: [BlockchainDaoService]
})
export class BlockchainDaoModule {}
