import { Module } from '@nestjs/common';
import { BlockchainModule } from 'src/entities/blockchain/blockchain.module';
import { ContractModule } from 'src/entities/contract/contract.module';

import { CompositeBlockchainModule } from 'src/services/blockchain/blockchain.module';

import { CollectionsService } from './collections.service';
import { TierConfigModule } from '../tierConfig/tierConfig.module';

@Module({
	imports: [BlockchainModule, CompositeBlockchainModule, ContractModule, TierConfigModule],
	providers: [CollectionsService],
	exports: [CollectionsService]
})
export class CollectionsModule {}
