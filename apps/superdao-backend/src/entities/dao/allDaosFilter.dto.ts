import { Field, InputType } from '@nestjs/graphql';

import { Dao } from 'src/entities/dao/dao.model';

@InputType()
export class AllDaosFilter implements Partial<Dao> {
	@Field(() => Boolean, { nullable: true })
	isVotingEnabled?: boolean;

	@Field(() => Boolean, { nullable: true })
	isClaimEnabled?: boolean;

	@Field(() => Boolean, { nullable: true })
	isInternal?: boolean;

	@Field(() => Boolean, { nullable: true })
	hasDemoProposals?: boolean;

	@Field(() => Boolean, { nullable: true })
	hasShortSlugAccess?: boolean;

	@Field(() => Boolean, { nullable: true })
	claimDeployDao?: boolean;
}
