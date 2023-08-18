import { useTranslation } from 'next-i18next';
import { FC, HTMLAttributes, useState } from 'react';
import values from 'lodash/values';
import some from 'lodash/some';

import { ProposalBlock } from './proposalBlock';
import { VotingChoice } from './votingChoice';

import { Button, Title3 } from 'src/components';
import { ProposalStatus, ProposalVotingType } from 'src/types/types.generated';
import { GetChoicesQuery, GetScoresQuery, GetVotesQuery, useVoteMutation } from 'src/gql/proposal.generated';

type Props = {
	proposalId: string;
	type: ProposalVotingType;
	choices: GetChoicesQuery['getChoices'];
	scores: GetScoresQuery['getScores'];
	status: ProposalStatus;
	userVotes: GetVotesQuery['getVotes'];
	userVoted: boolean;
	onUserVote: () => void;
	readonly: boolean;
};

type VotingOption = {
	score: number;
	selected: boolean;
};

type VotingState = {
	[key: string]: VotingOption;
};

export const ProposalVoting: FC<HTMLAttributes<HTMLDivElement> & Props> = ({
	proposalId,
	type,
	choices,
	scores,
	status,
	userVotes,
	userVoted,
	readonly,
	onUserVote,
	className
}) => {
	const { t } = useTranslation();

	const { mutateAsync: vote } = useVoteMutation();

	const votingMap = choices.map((choice) => ({
		[choice.id]: { score: scores.filter((score) => score.choiceId === choice.id)[0].value, selected: false }
	}));
	const votingReducer: VotingState = votingMap.reduce((acc: any, value: any) => {
		const addition = { ...acc, ...value };
		return addition;
	}, {});

	const [state, setState] = useState(votingReducer);

	const handleVote = () => {
		const choiceIds = Object.entries(state)
			.filter(([_, value]) => value.selected)
			.map(([key]) => key);

		vote({ proposalId, choiceIds }).then(async (success) => {
			if (success.vote) {
				onUserVote();
			}
		});
	};

	const handleClick = (choice: string) => {
		const stateScreenshot = { ...state };

		for (const [key, value] of Object.entries(stateScreenshot)) {
			if (key === choice) {
				stateScreenshot[key] = { ...value, selected: !value.selected };
			} else if (type === ProposalVotingType.SingleChoice || type === ProposalVotingType.YesNoAbstain) {
				stateScreenshot[key] = { ...value, selected: false };
			}
		}

		setState(stateScreenshot);
	};

	const totalScore = scores.reduce((acc, value) => acc + value.value, 0);
	const votingContent = choices.map((choice) => (
		<VotingChoice
			key={choice.id}
			status={status}
			isActive={state[choice.id].selected}
			isSelected={userVotes.map((vote) => vote.choiceId).includes(choice.id)}
			choice={choice.name}
			choiceId={choice.id}
			score={scores.filter((score) => score.choiceId === choice.id)[0].value}
			totalScore={totalScore}
			readonly={readonly}
			onVote={handleClick}
		/>
	));

	return (
		<ProposalBlock className={`${className} pb-6`} dataTestId={'ProposalBlock__votingBlock'}>
			<div className="mb-6 flex w-full items-center justify-between">
				<Title3 data-testid={'ProposalBlock__votingType'}>{t(`pages.votingProposal.votingTypes.${type}`)}</Title3>
			</div>
			<div>{votingContent}</div>
			{!readonly && !userVoted && (
				<div className="mt-6 flex w-full items-center justify-start">
					<Button
						disabled={!some(values(state), ({ selected }) => selected)}
						size="lg"
						color="accentPrimary"
						label={t('pages.votingProposal.voting.vote')}
						onClick={handleVote}
						data-testid={'ProposalBlock__voteButton'}
					/>
				</div>
			)}
		</ProposalBlock>
	);
};
