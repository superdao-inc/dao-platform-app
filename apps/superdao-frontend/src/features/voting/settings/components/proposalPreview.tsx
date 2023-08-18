import { ProposalVoting } from 'src/features/voting/proposal/components/proposalVoting';
import { ProposalContent } from 'src/features/voting/proposal/components/proposalContent';

import { ProposalStatus, ProposalVotingPowerType, ProposalVotingType } from 'src/types/types.generated';

type NotRegisteredChoice = {
	name: string;
};

type Props = {
	start: number | null;
	end: number;
	status: ProposalStatus;
	proposalName: string;
	attachment: string | null;
	proposalDescription: string;
	daoId: string;
	avatar: string | null;
	daoName: string;

	type: ProposalVotingType;
	votingPowerType: ProposalVotingPowerType;
	choices: NotRegisteredChoice[];

	onSwitch: () => void;
};

export const ProposalPreview = ({ onSwitch, ...proposalData }: Props) => {
	const { start, end, status, proposalName, attachment, proposalDescription, daoId, avatar, daoName } = proposalData;
	const proposalContent = { start, end, status, proposalName, attachment, proposalDescription, daoId, avatar, daoName };

	const mockedChoices = proposalData.choices
		.filter((choice) => choice.name)
		.map((choice, id) => ({ id: id.toString(), name: choice.name }));
	const mockedScores = mockedChoices.map((choice) => ({ choiceId: choice.id, value: 0 }));

	return (
		<>
			<ProposalContent {...proposalContent} />

			<ProposalVoting
				proposalId=""
				type={proposalData.type}
				choices={mockedChoices}
				scores={mockedScores}
				status={proposalData.status}
				userVotes={[]}
				userVoted={false}
				readonly
				onUserVote={() => {}}
				className="mt-4"
			/>
		</>
	);
};
