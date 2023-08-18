import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class FeedRequest {
	@Field(() => String, { nullable: true })
	daoId: string;

	@Field(() => Int, { defaultValue: 0 })
	offset: number;
}
