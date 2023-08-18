import { GetAllProposalsQuery, GetProposalQuery } from 'src/gql/proposal.generated';

export const parseDate = (date: Date) => {
	return `${`0${date.getMonth() + 1}`.slice(-2)}/${`0${date.getDate()}`.slice(-2)}/${date.getFullYear()}`;
};

export const isProposalPending = (
	proposalData?: GetProposalQuery['getProposal'] | GetAllProposalsQuery['proposals']['items'][number] | null
) => {
	return proposalData ? new Date(proposalData.startAt).getTime() > Date.now() : true;
};

export const isProposalActive = (
	proposalData?: GetProposalQuery['getProposal'] | GetAllProposalsQuery['proposals']['items'][number] | null
) => {
	return proposalData
		? new Date(proposalData.startAt).getTime() <= Date.now() && new Date(proposalData.endAt).getTime() >= Date.now()
		: false;
};

export const isProposalClosed = (
	proposalData?: GetProposalQuery['getProposal'] | GetAllProposalsQuery['proposals']['items'][number] | null
) => {
	return proposalData ? new Date(proposalData.endAt).getTime() < Date.now() : false;
};

export const getIpfsUrl = (ipfsLink?: string | null) => (ipfsLink ? 'ipfs/' + ipfsLink.split('://')[1] : '');
