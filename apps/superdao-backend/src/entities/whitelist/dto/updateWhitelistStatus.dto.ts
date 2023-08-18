import { Field, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { WhitelistStatusEnum } from '../whitelist.types';

@InputType()
export class UpdateWhitelistStatusInput {
	@Field(() => String)
	@IsUUID()
	id: string;

	@Field(() => WhitelistStatusEnum)
	status: WhitelistStatusEnum;
}
