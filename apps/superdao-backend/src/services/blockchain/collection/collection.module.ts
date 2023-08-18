import { Module } from '@nestjs/common';

// external modules
import { GraphModule } from 'src/services/the-graph/graph-polygon/graph.module';
import { ContractModule } from 'src/entities/contract/contract.module';

// helpers
import { BlockchainCollectionHelper } from './helpers/collection.helper';
import { BlockchainTierHelper } from './helpers/tier.helper';
import { BlockchainArtworkHelper } from './helpers/artwork.helper';

// services
import { BlockchainCollectionService } from './collection.service';

@Module({
	imports: [GraphModule, ContractModule],
	providers: [BlockchainCollectionService, BlockchainArtworkHelper, BlockchainCollectionHelper, BlockchainTierHelper],
	exports: [BlockchainCollectionService]
})
export class BlockchainCollectionModule {}
