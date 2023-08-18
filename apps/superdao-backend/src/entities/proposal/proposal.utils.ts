import { Proposal } from './proposal.model';
import { ProposalStatus } from './proposal.types';

export const validateProposalStartEndTime = (proposalStartTime: Date, proposalEndTime: Date): void => {
	const isStartTimeValid = !proposalStartTime || proposalStartTime.getTime() >= Date.now();
	const isEndTimeValid = proposalStartTime
		? proposalEndTime.getTime() >= proposalStartTime.getTime()
		: proposalEndTime.getTime() >= Date.now();

	if (!isStartTimeValid) {
		throw new Error('Proposal start date must be in the future');
	}

	if (!isEndTimeValid) {
		throw new Error('Proposal end date must be after the start date');
	}
};

export const getProposalStatus = (proposal: Proposal): ProposalStatus => {
	if (new Date(proposal.startAt).getTime() > Date.now()) return ProposalStatus.pending;
	if (new Date(proposal.endAt).getTime() < Date.now()) return ProposalStatus.closed;
	return ProposalStatus.active;
};
