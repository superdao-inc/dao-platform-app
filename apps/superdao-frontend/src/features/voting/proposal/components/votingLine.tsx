import { ProposalStatus } from 'src/types/types.generated';

type Props = {
	percents: number;
	status: ProposalStatus;
};

export const VotingLine = ({ percents, status }: Props) => {
	let colorStyles = 'bg-tintGrey';
	if (status === ProposalStatus.Closed) {
		colorStyles = 'bg-tintPurple';
	}
	if (status === ProposalStatus.Active) {
		colorStyles = 'bg-accentPositive';
	}

	return (
		<div className="bg-backgroundPrimary mt-[-8px] h-1 w-full rounded-sm" data-testid={`VotingChoice__votingLine`}>
			<div className={`mt-2 h-1 min-w-[4px] rounded-sm ${colorStyles}`} style={{ width: `${percents}%` }} />
		</div>
	);
};
