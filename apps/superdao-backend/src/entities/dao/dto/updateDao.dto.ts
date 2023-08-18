import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

import { Document, TierVotingWeight } from '../dao.types';
import { CreateDaoInput } from './createDao.dto';
import { SLUG_REGEX } from '@sd/superdao-shared';

@InputType()
export class UpdateDaoInput extends CreateDaoInput {
	@Field(() => ID)
	@IsUUID()
	id: string;

	@Field(() => String, { nullable: true })
	contractAddress: string;

	@Field(() => String, { nullable: true })
	openseaUrl: string;

	@Field(() => String, { nullable: true })
	@MinLength(1)
	@MaxLength(100)
	name: string;

	@Field(() => String, { nullable: true })
	@MinLength(1)
	description: string;

	@Field(() => String, { nullable: true })
	@MinLength(1)
	@MaxLength(100)
	@Matches(SLUG_REGEX)
	slug: string;

	@Field(() => [Document], { nullable: true })
	documents: Document[];

	@Field(() => [TierVotingWeight], { nullable: true })
	tiersVotingWeights: TierVotingWeight[];

	@Field(() => Boolean, { nullable: true })
	isVotingEnabled: boolean;

	@Field(() => Boolean, { nullable: true })
	isClaimEnabled: boolean;

	@Field(() => Boolean, { nullable: true, defaultValue: false })
	claimDeployDao: boolean;

	@Field(() => Boolean, { nullable: true, defaultValue: false })
	isInternal: boolean;
}
