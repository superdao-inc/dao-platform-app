import { useTranslation } from 'next-i18next';
import { FC, HTMLAttributes, useState } from 'react';

import { VoteDisplay } from './voteDisplay';
import { ProposalBlock } from './proposalBlock';

import { Label1, Title3 } from 'src/components';
import { GetVotesQuery, GetChoicesQuery } from 'src/gql/proposal.generated';

type Props = {
	votesCount: number;
	votes: GetVotesQuery['getVotes'];
	choices: GetChoicesQuery['getChoices'];
	currentUserId: string;
	daoSlug: string;
};

export const ProposalVotes: FC<HTMLAttributes<HTMLDivElement> & Props> = ({
	votes,
	choices,
	votesCount,
	className,
	currentUserId,
	daoSlug
}) => {
	const { t } = useTranslation();
	const [showAll, setShowAll] = useState(votes.length <= 5);
	if (!votesCount) {
		return null;
	}
	const handleShowAll = () => setShowAll(true);

	const votesContent = votes
		.slice(0, showAll ? votes.length : 5)
		.map((vote) => (
			<VoteDisplay
				key={vote.choiceId + vote.user.id}
				className="mb-4 last:mb-0"
				choices={choices}
				choiceId={vote.choiceId}
				voter={vote.user}
				isCurrentUser={currentUserId === vote.user.id}
				daoSlug={daoSlug}
			/>
		));

	return (
		<ProposalBlock className={className} data-testid={'ProposalBlock__votesBlock'}>
			<div className="flex w-full justify-between gap-2">
				<div className="flex gap-2">
					<Title3 data-testid={'ProposalBlock__votesTitle'}>{t('pages.votingProposal.votes')}</Title3>
					{!!votesCount && (
						<Title3 className="text-foregroundTertiary" data-testid={'ProposalBlock__votesCount'}>
							{votesCount}
						</Title3>
					)}
				</div>
				{!showAll && (
					<Label1 className="text-accentPrimary cursor-pointer" onClick={handleShowAll}>
						{t(`pages.votingProposal.voting.seeAll`)}
					</Label1>
				)}
			</div>
			<div className="mt-2 lg:mt-6" data-testid={'ProposalBlock__votesContent'}>
				{votesContent}
			</div>
		</ProposalBlock>
	);
};
