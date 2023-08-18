import { Module } from '@nestjs/common';

import { BlockchainERC721PropertiesContractService } from './erc721Properties.service';

@Module({
	imports: [],
	providers: [BlockchainERC721PropertiesContractService],
	exports: [BlockchainERC721PropertiesContractService]
})
export class BlockchainERC721PropertiesContractModule {}
