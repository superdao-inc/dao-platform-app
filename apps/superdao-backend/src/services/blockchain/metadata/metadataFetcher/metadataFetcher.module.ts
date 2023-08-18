import { Module } from '@nestjs/common';

import { BlockchainMetadataFetcherService } from './metadataFetcher.service';

@Module({
	providers: [BlockchainMetadataFetcherService],
	exports: [BlockchainMetadataFetcherService]
})
export class BlockchainMetadataFetcherModule {}
