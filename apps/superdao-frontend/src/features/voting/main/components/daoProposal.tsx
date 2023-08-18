import { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import _upperFirst from 'lodash/upperFirst';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import Markdown from 'markdown-to-jsx';

import { Dot, DotSeparator, FlexBody, StyledProposalContent, Wrapper } from '../../internal/decorators';

import { Avatar, Ellipsis, Label1, Title3, Body, SubHeading, ProposalAttachment } from 'src/components';
import { VotedIcon } from 'src/components/assets/icons/voted';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { GetAllProposalsQuery } from 'src/gql/proposal.generated';
import { ProposalStatus } from 'src/types/types.generated';
import { getOptimizedFileUrl } from 'src/utils/upload';
import { markdownConfig } from 'src/utils/markdown';
import {
	isProposalActive as isCurrentProposalActive,
	isProposalClosed as isCurrentProposalClosed,
	isProposalPending as isCurrentProposalPending
} from '../../internal/helpers';
import { colors } from 'src/style';

type Props = {
	proposal: GetAllProposalsQuery['proposals']['items'][number];
	daoId: string;
	slug: string;
};

export const DaoProposal = ({ daoId, slug, proposal }: Props) => {
	const { t } = useTranslation();
	const { push } = useRouter();

	const { data: daoData } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug } = daoData ?? {};

	const endDate = DateTime.fromSeconds(new Date(proposal.endAt).getTime() / 1000);
	const now = DateTime.fromMillis(new Date().getTime());

	const endDiff = endDate.diff(now, ['days', 'hours', 'minutes']);

	const isProposalActive = isCurrentProposalActive(proposal);
	const isProposalClosed = isCurrentProposalClosed(proposal);
	const isProposalUpcoming = isCurrentProposalPending(proposal);

	const hasProposalResult = isProposalClosed;
	const sortedProposalScores = proposal.scores.sort((prev, next) => next.value - prev.value);
	const proposalResultChoiceId = sortedProposalScores[0].choiceId;
	const proposalResultChoice = proposal.choices.find((choice) => choice.id === proposalResultChoiceId)?.name ?? '';
	const votesCount = proposal.votes.length;

	const proposalTimeToEnd = useMemo(() => {
		const isEndDiffInDays = endDiff.toObject().days! > 0;
		const isEndDiffInHours = endDiff.toObject().hours! > 0;

		if (isProposalActive) {
			let diffText = t('components.dao.voting.proposal.activeFor.days', { count: endDiff.toObject().days! });
			if (!isEndDiffInDays) {
				diffText = t('components.dao.voting.proposal.activeFor.hours', {
					count: +endDiff.toObject().hours!.toFixed(0)
				});

				if (!isEndDiffInHours) {
					diffText = t('components.dao.voting.proposal.activeFor.minutes', {
						count: +endDiff.toObject().minutes!.toFixed(0)
					});
				}
			}
			return diffText;
		}

		return null;
	}, [endDiff, isProposalActive, t]);

	const proposalStatusKey = useMemo(() => {
		if (isProposalActive) return ProposalStatus.Active;
		if (isProposalClosed) return ProposalStatus.Closed;
		if (isProposalUpcoming) return ProposalStatus.Pending;
	}, [isProposalActive, isProposalClosed, isProposalUpcoming]);

	if (!daoBySlug) return null;

	const handleRedirectToProposal = () => {
		push(`/${slug}/voting/${proposal.id}`);
	};

	return (
		<Wrapper onClick={handleRedirectToProposal} data-testid={`DaoProposal__body${proposal.id}`}>
			<div className="flex w-full justify-between">
				<div className="flex min-w-0 items-center gap-3" data-testid={'DaoProposal__author'}>
					<Avatar
						size="xs"
						seed={daoId}
						src={daoBySlug.avatar ? getOptimizedFileUrl(daoBySlug.avatar) : undefined}
						data-testid={'DaoProposal__authorAvatar'}
					/>
					<Label1 className="truncate" data-testid={'DaoProposal__authorName'}>
						{daoBySlug.name}
					</Label1>
				</div>
				<div className="flex items-center gap-3">
					<Body
						className="text-foregroundTertiary"
						data-testid={
							proposalTimeToEnd
								? 'DaoProposal__timeToEnd'
								: `DaoProposal__status${_upperFirst(t(`${isProposalUpcoming ? 'upcoming' : proposalStatusKey}`))}`
						}
					>
						{proposalTimeToEnd
							? proposalTimeToEnd
							: _upperFirst(t(`pages.votingProposal.${isProposalUpcoming ? 'upcoming' : proposalStatusKey}`))}
					</Body>
					<Dot state={proposalStatusKey ?? undefined} />
				</div>
			</div>

			<Title3 className="mt-3 mb-2 break-words" data-testid={'DaoProposal__title'}>
				{proposal.title}
			</Title3>
			<StyledProposalContent>
				{proposal.attachment && (
					<ProposalAttachment className="mt-4 rounded-lg first:mt-0" attachmentId={proposal.attachment} />
				)}
				<Markdown color={colors.foregroundSecondary} options={markdownConfig} data-testid={'DaoProposal__description'}>
					{proposal.description}
				</Markdown>
			</StyledProposalContent>

			<div className={`flex items-center gap-3 ${proposalStatusKey !== ProposalStatus.Pending ? 'mt-3' : ''}`}>
				{proposal.createdBySuperdao && (
					<div className="bg-backgroundGrey rounded py-[6px] px-3" data-testid={'DaoProposal__demoProposalLabel'}>
						<SubHeading className="text-foregroundSecondary">{t('pages.votingProposal.createdBySuperdao')}</SubHeading>
					</div>
				)}

				{hasProposalResult && (
					<div className="flex items-center gap-3 overflow-hidden" data-testid={'DaoProposal__results'}>
						<VotedIcon />
						<Ellipsis className="w-max" as={FlexBody} data-testid={'DaoProposal__resultsChoice'}>
							{proposalResultChoice}
						</Ellipsis>
						<DotSeparator />
						<Body className="text-foregroundTertiary" data-testid={'DaoProposal__resultsVotesAmount'}>{`${t(
							'pages.votingProposal.voting.votes',
							{
								count: votesCount
							}
						)}`}</Body>
					</div>
				)}
			</div>
		</Wrapper>
	);
};
