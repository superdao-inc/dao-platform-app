import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientFeature } from './clientFeature.model';
import { NotFoundError } from 'src/exceptions';

import { CreateFeatureDto } from 'src/entities/onboarding/dto/createFeature.dto';
import { UpdateFeatureDto } from 'src/entities/onboarding/dto/updateFeature.dto';
import { AuthGuard } from 'src/auth.guard';

@Resolver(() => ClientFeature)
export class ClientFeatureResolver {
	constructor(@InjectRepository(ClientFeature) private clientFeatureRepository: Repository<ClientFeature>) {}

	@UseGuards(AuthGuard)
	@Query(() => ClientFeature)
	async clientFeatureById(@Args('id') id: string) {
		const clientFeature = await this.clientFeatureRepository.findOneBy({ id });
		if (!clientFeature) throw new NotFoundError();

		return clientFeature;
	}

	@UseGuards(AuthGuard)
	@Query(() => [ClientFeature])
	clientFeatures() {
		return this.clientFeatureRepository.find();
	}

	@UseGuards(AuthGuard)
	@Mutation(() => ClientFeature)
	createClientFeature(@Args('clientFeature') clientFeature: CreateFeatureDto) {
		const newClientFeature = new ClientFeature();
		newClientFeature.name = clientFeature.name;
		return newClientFeature.save();
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async updateClientFeature(@Args('clientFeature') clientFeature: UpdateFeatureDto) {
		const updatedClientFeature = await this.clientFeatureRepository.update(clientFeature.id, clientFeature);
		if (!updatedClientFeature.affected) throw new NotFoundError();
		return true;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async deleteClientFeature(@Args('id') id: string) {
		const deletedClientFeature = await this.clientFeatureRepository.delete(id);
		if (!deletedClientFeature) throw new NotFoundError();
		return true;
	}
}
