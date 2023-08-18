import { useRouter } from 'next/router';
import { useMemo } from 'react';

import { useTranslation } from 'next-i18next';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { Button, PageContent, PageLoader, toast } from 'src/components';
import { ProposalHeading } from 'src/features/voting/proposal/components/proposalHeading';
import { ProposalContent } from 'src/features/voting/proposal/components/proposalContent';
import { ProposalVotes } from 'src/features/voting/proposal/components/proposalVotes';
import { UserAPI } from 'src/features/user';
import { ProposalVoting } from 'src/features/voting/proposal/components/proposalVoting';
import { useGetProposalQuery, useGetVotesQuery } from 'src/gql/proposal.generated';
import { ProposalStatus } from 'src/types/types.generated';
import { useQueryEffect } from 'src/hooks/use-query-effect';
import { CustomHead } from 'src/components/head';
import {
	isProposalActive as isCurrentProposalActive,
	isProposalClosed as isCurrentProposalClosed,
	isProposalPending as isCurrentProposalPending
} from '../../internal/helpers';
import { isAdmin } from 'src/utils/roles';

type Props = {
	daoId: string;
	slug: string;
	proposal: string;
};

export const VotingProposal = ({ daoId, slug, proposal }: Props) => {
	const { t } = useTranslation();
	const { push } = useRouter();

	const handleCreateEffect = () => {
		toast.success(t('pages.votingProposal.toasts.publish'), { duration: 3000, position: 'bottom-center' });
	};

	const handleEditEffect = () => {
		toast.success(t('pages.votingProposal.toasts.edit'), { duration: 3000, position: 'bottom-center' });
	};

	useQueryEffect('created', handleCreateEffect);
	useQueryEffect('edited', handleEditEffect);

	const { data: user, isLoading: isUserLoading } = UserAPI.useCurrentUserQuery();
	const { currentUser: userData } = user || {};

	const { data: memberRoleData } = UserAPI.useCurrentUserMemberRoleQuery({ daoId });
	const { currentUserMemberRole } = memberRoleData || {};
	const isCreator = isAdmin(currentUserMemberRole);

	const { data, isLoading: isDaoRolesLoading } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug: daoData } = data || {};

	const {
		data: proposalData,
		isLoading: isProposalLoading,
		refetch: proposalRefetch
	} = useGetProposalQuery({ proposalId: proposal });
	const {
		data: votesData,
		isLoading: isVotesLoading,
		refetch: votesRefetch
	} = useGetVotesQuery({ proposalId: proposal });

	const isProposalActive = isCurrentProposalActive(proposalData?.getProposal);
	const isProposalClosed = isCurrentProposalClosed(proposalData?.getProposal);
	const isProposalUpcoming = isCurrentProposalPending(proposalData?.getProposal);

	const proposalStatusKey = useMemo(() => {
		if (isProposalActive) return ProposalStatus.Active;
		if (isProposalClosed) return ProposalStatus.Closed;
		if (isProposalUpcoming) return ProposalStatus.Pending;

		return ProposalStatus.Pending;
	}, [isProposalActive, isProposalClosed, isProposalUpcoming]);

	const handleBack = () => {
		push(`/${slug}/voting`);
	};

	const handleEditProposal = () => {
		push(`/${slug}/voting/${proposal}/edit`);
	};

	const handleRefetch = () => {
		proposalRefetch();
		votesRefetch();
	};

	if (!isUserLoading || !isDaoRolesLoading || !isProposalLoading || isVotesLoading) {
		<PageContent onBack={handleBack}>
			<CustomHead
				main={daoData?.name ? daoData?.name : 'Proposal'}
				additional={daoData?.name ? 'Proposal' : 'Superdao'}
				description={'Proposal on Superdao'}
			/>
			<PageLoader />
		</PageContent>;
	}

	if (!daoData || !proposalData || !proposalData?.getProposal || !userData || !votesData) {
		return null;
	}

	const votesCount = votesData.getVotes.length;
	const userVoteRawData = votesData.getVotes.filter((vote) => userData.id === vote.user.id);
	const userVoted = !!userVoteRawData.length;
	const userVotes = userVoteRawData;

	return (
		<PageContent onBack={handleBack}>
			<CustomHead main={daoData.name} additional={'Proposal'} description={'Proposal on Superdao'} />

			<ProposalHeading
				slug={slug}
				proposal={proposal}
				status={proposalStatusKey}
				isCreator={isCreator}
				onBack={handleBack}
			/>

			<ProposalContent
				start={new Date(proposalData.getProposal.startAt).getTime() / 1000}
				end={new Date(proposalData.getProposal.endAt).getTime() / 1000}
				status={proposalStatusKey}
				proposalName={proposalData.getProposal.title}
				proposalDescription={proposalData.getProposal.description}
				attachment={proposalData.getProposal.attachment}
				daoId={daoId}
				daoName={daoData.name}
				avatar={daoData.avatar}
				isDemo={proposalData.getProposal.createdBySuperdao}
			/>

			<ProposalVoting
				proposalId={proposal}
				type={proposalData.getProposal.votingType}
				choices={proposalData.getProposal.choices}
				scores={proposalData.getProposal.scores}
				status={proposalStatusKey}
				userVotes={userVotes}
				userVoted={userVoted}
				readonly={!currentUserMemberRole || userVoted || proposalStatusKey !== ProposalStatus.Active}
				onUserVote={handleRefetch}
				className="mt-4"
			/>

			<ProposalVotes
				className="mt-4"
				choices={proposalData.getProposal.choices}
				votes={votesData.getVotes}
				votesCount={votesCount}
				daoSlug={slug}
				currentUserId={userData.id}
			/>

			{proposalStatusKey === ProposalStatus.Pending && isCreator && (
				<Button
					className="mt-8"
					size="lg"
					color="accentPrimary"
					label={t('actions.labels.edit')}
					onClick={handleEditProposal}
					data-testid={'ProposalDetails__editButton'}
				/>
			)}
		</PageContent>
	);
};
