import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class DeletePostInput {
	@Field(() => ID)
	@IsUUID()
	postId: string;
}
