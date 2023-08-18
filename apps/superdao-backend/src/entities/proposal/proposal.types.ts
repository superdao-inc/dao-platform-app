import { IsUUID } from 'class-validator';
import { ArgsType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { PaginationWithSearch } from 'src/gql/pagination';

export enum ProposalStatus {
	active = 'active',
	pending = 'pending',
	closed = 'closed'
}
registerEnumType(ProposalStatus, {
	name: 'ProposalStatus',
	description: 'Proposal status'
});

export enum ProposalVotingType {
	yesNoAbstain = 'yesNoAbstain',
	singleChoice = 'singleChoice',
	multipleChoice = 'multipleChoice'
}
registerEnumType(ProposalVotingType, {
	name: 'ProposalVotingType',
	description: 'Proposal voting type'
});

export enum ProposalVotingPowerType {
	single = 'single',
	calculating = 'calculating'
}
registerEnumType(ProposalVotingPowerType, {
	name: 'ProposalVotingPowerType',
	description: 'Proposal power voting type'
});

@ArgsType()
export class DaoProposalsRequest extends PaginationWithSearch {
	@Field(() => ID)
	@IsUUID()
	daoId: string;

	@Field(() => ProposalStatus, { nullable: true })
	status: ProposalStatus;
}

@ArgsType()
export class VoteRequest {
	@Field(() => String)
	proposalId: string;

	@Field(() => [String])
	choiceIds: string[];
}
