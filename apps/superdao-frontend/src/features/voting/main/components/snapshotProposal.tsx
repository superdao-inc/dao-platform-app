import { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import _upperFirst from 'lodash/upperFirst';
import { DateTime } from 'luxon';
import Markdown from 'markdown-to-jsx';
import { ipfsProxyUrl } from '@sd/superdao-shared';

import { Dot, DotSeparator, FlexBody, StyledProposalContent, Wrapper, HintBody } from '../../internal/decorators';

import { ProposalType } from 'src/features/snapshot/namespace';
import { Proposal, Space } from 'src/types/snapshot.generated';
import { Avatar, Body, Ellipsis, Label1, Title3 } from 'src/components';
import { VotedIcon } from 'src/components/assets/icons/voted';
import { openExternal } from 'src/utils/urls';
import { ProposalStatus } from 'src/types/types.generated';
import { markdownConfig } from 'src/utils/markdown';
import { getIpfsUrl } from '../../internal/helpers';

type Props = {
	proposal: Proposal;
	space: Space | undefined;
	daoId: string;
};

export const SnapshotProposal = ({ daoId, proposal, space }: Props) => {
	const { t } = useTranslation();

	const endDate = DateTime.fromSeconds(proposal.end);
	const now = DateTime.fromMillis(new Date().getTime());

	const endDiff = endDate.diff(now, ['days', 'hours', 'minutes']);

	const { choices, scores } = proposal;

	const maxScore = Math.max(...(scores as number[]));
	const maxScoreIndex = (scores as number[]).indexOf(maxScore);

	const handleOpenProposal = () => {
		openExternal(`https://snapshot.org/#/${space?.id}/proposal/${proposal.id}`);
	};

	const hasProposalResult = proposal?.state === ProposalType.CLOSED && maxScoreIndex !== -1;
	const proposalTimeToEnd = useMemo(() => {
		const isEndDiffInDays = endDiff.toObject().days! > 0;
		const isEndDiffInHours = endDiff.toObject().hours! > 0;

		switch (proposal?.state) {
			case ProposalType.CLOSED: {
				return null;
			}

			case ProposalType.PENDING: {
				return null;
			}

			default: {
				let diffText = t('components.dao.voting.proposal.active.days', { count: endDiff.toObject().days! });
				if (!isEndDiffInDays) {
					diffText = t('components.dao.voting.proposal.active.hours', { count: +endDiff.toObject().hours!.toFixed(0) });

					if (!isEndDiffInHours) {
						diffText = t('components.dao.voting.proposal.active.minutes', {
							count: +endDiff.toObject().minutes!.toFixed(0)
						});
					}
				}
				return diffText;
			}
		}
	}, [endDiff, proposal?.state, t]);

	return (
		<Wrapper onClick={handleOpenProposal}>
			<div className="flex w-full justify-between">
				<div className="flex min-w-0 items-center gap-3">
					<div className="bg-backgroundTertiary h-6 w-6 rounded-full">
						{space && <Avatar size="xs" seed={daoId} src={`${ipfsProxyUrl}/${getIpfsUrl(space.avatar)}`} />}
					</div>
					<Label1 className="truncate">{space?.name}</Label1>
					<HintBody className="onSnapshot">{t('components.dao.voting.onSnapshot')}</HintBody>
				</div>
				<div className="flex items-center gap-3">
					<Body className="text-foregroundTertiary">
						{_upperFirst(
							proposal?.state
								? t(`pages.votingProposal.${proposal.state === ProposalStatus.Pending ? 'upcoming' : proposal.state}`)
								: ''
						)}
					</Body>
					<Dot state={proposal?.state ?? undefined} />
				</div>
			</div>

			<Title3 className="mt-3 mb-2 break-words">{proposal.title}</Title3>
			<StyledProposalContent>
				<Markdown options={markdownConfig}>{proposal?.body ?? ''}</Markdown>
			</StyledProposalContent>

			{proposalTimeToEnd && <Body className="text-foregroundTertiary">{proposalTimeToEnd}</Body>}

			<div className="flex items-center gap-3">
				{hasProposalResult && (
					<div className="flex items-center gap-3 overflow-hidden">
						<VotedIcon />
						<Ellipsis className="w-max" as={FlexBody}>
							{choices[maxScoreIndex]}
						</Ellipsis>
						<DotSeparator />
						<Body className="text-foregroundTertiary">{`${Math.floor(scores?.[maxScoreIndex] ?? 0)} ${
							space?.symbol
						}`}</Body>
					</div>
				)}
			</div>
		</Wrapper>
	);
};
