import { Field, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { sanitizeStringTransform } from '@sd/superdao-shared';

@InputType()
export class UpdateWalletInput {
	@Field(() => String)
	@IsUUID()
	id: string;

	@Field(() => String)
	@Transform(sanitizeStringTransform)
	name: string;

	@Field(() => String, { nullable: true })
	@Transform(sanitizeStringTransform)
	description?: string;
}
