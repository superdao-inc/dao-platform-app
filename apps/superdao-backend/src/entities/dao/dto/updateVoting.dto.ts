import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { TierVotingWeight } from '../dao.types';

@InputType()
export class UpdateVotingInput {
	@Field(() => ID)
	@IsUUID()
	id: string;

	@Field(() => [TierVotingWeight], { nullable: true })
	tiersVotingWeights: TierVotingWeight[];
}
