import { Module } from '@nestjs/common';

import { GraphModule } from 'src/services/the-graph/graph-polygon/graph.module';

import { BlockchainTreasuryService } from './treasury.service';

@Module({
	imports: [GraphModule],
	providers: [BlockchainTreasuryService],
	exports: [BlockchainTreasuryService]
})
export class BlockchainTreasuryModule {}
