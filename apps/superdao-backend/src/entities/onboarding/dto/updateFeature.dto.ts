import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID, MaxLength, MinLength } from 'class-validator';

import { ClientFeature } from '../clientFeature.model';

@InputType()
export class UpdateFeatureDto implements Partial<ClientFeature> {
	@Field(() => ID)
	@IsUUID()
	id: string;

	@Field()
	@MinLength(1)
	@MaxLength(100)
	name: string;
}
