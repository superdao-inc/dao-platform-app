import { Module } from '@nestjs/common';

import { BlockchainAdminContractService } from './admin.service';

@Module({
	imports: [],
	providers: [BlockchainAdminContractService],
	exports: [BlockchainAdminContractService]
})
export class BlockchainAdminContractModule {}
