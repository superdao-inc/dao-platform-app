import { useTranslation } from 'next-i18next';
import { FC, HTMLAttributes, useState } from 'react';

import { VotingLine } from './votingLine';

import { DoneIcon, Ellipsis, Label1, SubHeading } from 'src/components';
import { ProposalStatus } from 'src/types/types.generated';
import Tooltip from 'src/components/tooltip';

type Props = {
	status: ProposalStatus;
	isActive: boolean;
	isSelected: boolean;
	choice: string;
	choiceId: string;
	score: number;
	totalScore: number;
	readonly: boolean;
	onVote: (choice: string) => void;
};

export const VotingChoice: FC<HTMLAttributes<HTMLDivElement> & Props> = ({
	status,
	isActive,
	isSelected,
	choice,
	choiceId,
	score,
	totalScore,
	readonly,
	onVote,
	className
}) => {
	const { t } = useTranslation();

	const [hovered, setHovered] = useState(false);

	const bindClick = (choiceId: string) => {
		return () => {
			if (!readonly) {
				onVote(choiceId);
			}
		};
	};

	let SelectionIndicator = (
		<div
			className={`border-foregroundQuaternary flex h-10 w-10 items-center justify-center rounded-full border-[1px] transition-all ${
				readonly ? '' : 'hover:bg-backgroundTertiary'
			} ${hovered && !readonly && status === ProposalStatus.Active ? 'bg-backgroundTertiary' : ''}`}
			data-testid={`VotingChoice__activeReadOnlyIcon`}
		>
			<DoneIcon width={20} height={20} fill="#717A8C" />
		</div>
	);
	if (isSelected && status === ProposalStatus.Closed) {
		SelectionIndicator = (
			<div
				className="bg-tintPurple flex h-10 w-10 items-center justify-center rounded-full"
				data-testid={`VotingChoice__closedSelectedIcon`}
			>
				<DoneIcon width={20} height={20} fill="#fff" />
			</div>
		);
	} else if (isSelected && status === ProposalStatus.Active) {
		SelectionIndicator = (
			<div
				className="bg-accentPositive flex h-10 w-10 items-center justify-center rounded-full"
				data-testid={`VotingChoice__activeSelectedIcon`}
			>
				<DoneIcon width={20} height={20} fill="#252B36" />
			</div>
		);
	} else if (isActive && status === ProposalStatus.Closed) {
		SelectionIndicator = (
			<div
				className="bg-tintPurple flex h-10 w-10 items-center justify-center rounded-full"
				data-testid={`VotingChoice__closedNotSelectedIcon`}
			>
				<DoneIcon width={20} height={20} fill="#fff" />
			</div>
		);
	} else if (isActive && status === ProposalStatus.Active) {
		SelectionIndicator = (
			<div
				className="bg-foregroundPrimary flex h-10 w-10 items-center justify-center rounded-full"
				data-testid={`VotingChoice__activeNotSelectedIcon`}
			>
				<DoneIcon width={20} height={20} fill="#252B36" />
			</div>
		);
	}

	let percents = Math.round((score / totalScore) * 100);
	if (Number.isNaN(percents)) {
		percents = 0;
	}

	return (
		<div
			className={`mb-5 flex w-full items-start items-center gap-4 last:mb-0 lg:gap-6 ${
				readonly ? '' : 'cursor-pointer'
			} ${className}`}
			onClick={bindClick(choiceId)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			data-testid={`VotingChoice__option_${choice}`}
		>
			{SelectionIndicator}
			<div className="flex-1 overflow-hidden">
				<div className="mt-1.5 flex w-full flex-col pb-2.5 lg:flex-row lg:items-center lg:justify-between ">
					<Tooltip className="min-w-0" content={<Ellipsis as={SubHeading}>{choice}</Ellipsis>} placement="bottom">
						<Label1 data-testid={`VotingChoice__choiceText`}>{choice}</Label1>
					</Tooltip>
					<div className="flex items-center">
						{!!score && (
							<SubHeading
								className="text-foregroundSecondary whitespace-nowrap lg:pl-[10px]"
								data-testid={`VotingChoice__score`}
							>
								{t('pages.votingProposal.voting.votes', { count: score })} ·
							</SubHeading>
						)}
						<Label1 className="pl-[5px] text-right first:pl-[0px]" data-testid={`VotingChoice__percents`}>
							{percents}%
						</Label1>
					</div>
				</div>
				<VotingLine percents={percents} status={status} />
			</div>
		</div>
	);
};
