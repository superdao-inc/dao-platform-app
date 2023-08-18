import { Field, InputType } from '@nestjs/graphql';
import { MaxLength, MinLength } from 'class-validator';

import { PROPOSAL_TITLE_MAX_LENGTH } from '@sd/superdao-shared';

import { Proposal } from 'src/entities/proposal/proposal.model';
import { ProposalVotingPowerType, ProposalVotingType } from 'src/entities/proposal/proposal.types';

@InputType()
export class ProposalSettingsDto implements Partial<Proposal> {
	@Field(() => String)
	@MinLength(1)
	@MaxLength(PROPOSAL_TITLE_MAX_LENGTH)
	title: string;

	@Field(() => String)
	description: string;

	@Field(() => String, { nullable: true })
	attachment: string;

	@Field(() => String)
	daoId: string;

	@Field(() => ProposalVotingType)
	votingType: ProposalVotingType;

	@Field(() => ProposalVotingPowerType)
	votingPowerType: ProposalVotingPowerType;

	@Field({ nullable: true })
	startAt: Date;

	@Field()
	endAt: Date;
}
