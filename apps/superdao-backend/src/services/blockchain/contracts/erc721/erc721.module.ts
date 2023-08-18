import { Module } from '@nestjs/common';

import { BlockchainERC721ContractService } from './erc721.service';

@Module({
	imports: [],
	providers: [BlockchainERC721ContractService],
	exports: [BlockchainERC721ContractService]
})
export class BlockchainERC721ContractModule {}
