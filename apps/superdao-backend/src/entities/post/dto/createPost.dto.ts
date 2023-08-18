import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { sanitizeStringTransform } from '@sd/superdao-shared';

@InputType()
export class CreatePostInput {
	@Field(() => ID)
	@IsUUID()
	daoId: string;

	@Field(() => String)
	@Transform(sanitizeStringTransform)
	text: string;

	@Field(() => [String])
	attachments: string[];
}
