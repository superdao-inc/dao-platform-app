import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SUPPORTED_NETWORKS } from '@sd/superdao-shared';
import { NetworkEntity } from './network.model';
import { toEntities } from './network.service';
import { AuthGuard } from 'src/auth.guard';

@Resolver(() => NetworkEntity)
export class NetworkResolver {
	@UseGuards(AuthGuard)
	@Query(() => [NetworkEntity], { name: 'networks' })
	networks(): NetworkEntity[] {
		return toEntities(SUPPORTED_NETWORKS);
	}
}
