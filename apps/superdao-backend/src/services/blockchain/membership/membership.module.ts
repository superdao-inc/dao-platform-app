import { Module } from '@nestjs/common';

import { GraphModule } from 'src/services/the-graph/graph-polygon/graph.module';

import { BlockchainAdminContractModule } from '../contracts/admin/admin.module';
import { BlockchainERC721ContractModule } from '../contracts/erc721/erc721.module';
import { BlockchainMembershipHelper } from './membership.helper';

import { BlockchainMembershipService } from './membership.service';

@Module({
	imports: [GraphModule, BlockchainAdminContractModule, BlockchainERC721ContractModule],
	providers: [BlockchainMembershipService, BlockchainMembershipHelper],
	exports: [BlockchainMembershipService]
})
export class BlockchainMembershipModule {}
