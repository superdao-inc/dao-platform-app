import { Field, InputType } from '@nestjs/graphql';
import { MaxLength, MinLength } from 'class-validator';

import { ClientFeature } from '../clientFeature.model';

@InputType()
export class CreateFeatureDto implements Partial<ClientFeature> {
	@Field()
	@MinLength(1)
	@MaxLength(100)
	name: string;
}
