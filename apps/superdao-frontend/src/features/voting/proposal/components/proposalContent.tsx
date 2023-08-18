import { useTranslation } from 'next-i18next';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Dot } from '../../internal/decorators';
import { ProposalBlock } from './proposalBlock';

import { Avatar, Body, Label1, SubHeading, Title2 } from 'src/components';
import { ProposalStatus } from 'src/types/types.generated';
import { getOptimizedFileUrl } from 'src/utils/upload';

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
	isDemo?: boolean;
};

export const ProposalContent = ({
	start,
	end,
	status,
	proposalName,
	proposalDescription,
	attachment,
	daoId,
	avatar,
	daoName,
	isDemo
}: Props) => {
	const { t } = useTranslation();

	const [needShowMore, setNeedShowMore] = useState(false);
	const [showMore, setShowMore] = useState(false);

	const descriptionRef = useRef<HTMLElement>(null);
	useEffect(() => {
		if (descriptionRef.current?.offsetHeight === 164 || descriptionRef.current?.offsetHeight === 60) {
			setNeedShowMore(true);
		}
	}, []);

	const handleChangeDescriptionSize = () => {
		setShowMore(!showMore);
	};

	const startDate = DateTime.fromSeconds(start ?? Date.now() / 1000);
	const endDate = DateTime.fromSeconds(end);
	const now = DateTime.fromMillis(new Date().getTime());

	const endDiff = endDate.diff(now, ['days', 'hours', 'minutes']);
	const startDiff = startDate.diff(now, ['days', 'hours', 'minutes']);

	const proposalTimeToEnd = useMemo(() => {
		const isEndDiffInDays = endDiff.toObject().days! > 0;
		const isEndDiffInHours = endDiff.toObject().hours! > 0;

		const isStartDiffInDays = startDiff.toObject().days! > 0;
		const isStartDiffInHours = startDiff.toObject().hours! > 0;

		switch (status) {
			case ProposalStatus.Closed: {
				return (
					<Body>
						{t('components.dao.voting.proposal.closed', {
							day: endDate.day,
							month: endDate.setLocale('en').monthLong,
							year: endDate.year
						})}
					</Body>
				);
			}

			case ProposalStatus.Pending: {
				let diffText = t('components.dao.voting.proposal.pending', {
					day: startDate.day,
					month: startDate.setLocale('en').monthLong
				});
				if (!isStartDiffInDays) {
					diffText = t('components.dao.voting.proposal.upcoming.hours', {
						count: +endDiff.toObject().hours!.toFixed(0)
					});

					if (!isStartDiffInHours) {
						diffText = t('components.dao.voting.proposal.upcoming.minutes', {
							count: +endDiff.toObject().minutes!.toFixed(0)
						});
					}
				}

				return <Body>{diffText}</Body>;
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
				return <Body>{diffText}</Body>;
			}
		}
	}, [endDate, endDiff, startDate, startDiff, status, t]);

	return (
		<ProposalBlock dataTestId={'ProposalBlock__infoBlock'}>
			<div className="flex w-full justify-between">
				<div className="flex min-w-0 items-center gap-3" data-testid={'ProposalBlock__author'}>
					<Avatar
						size="xs"
						seed={daoId}
						src={avatar ? getOptimizedFileUrl(avatar) : undefined}
						data-testid={'ProposalBlock__authorAvatar'}
					/>
					<Label1 className="truncate" data-testid={'ProposalBlock__authorName'}>
						{daoName}
					</Label1>
				</div>
				<div className="flex items-center gap-3 whitespace-nowrap" data-testid={'ProposalBlock__timeToEnd'}>
					<Body className="text-foregroundTertiary">{proposalTimeToEnd}</Body>
					<Dot state={status} />
				</div>
			</div>
			<Title2 className="mt-4 break-words" data-testid={'ProposalBlock__proposalName'}>
				{proposalName}
			</Title2>
			<Body
				className={`text-foregroundTertiary mt-3 overflow-hidden break-words leading-5 lg:leading-6 ${
					showMore ? '' : `max-h-[60px] lg:max-h-[164px]`
				}`}
				ref={descriptionRef}
				data-testid={'ProposalBlock__proposalDescription'}
			>
				{proposalDescription}
			</Body>

			{needShowMore && (
				<Label1
					className="text-accentPrimary mt-1 cursor-pointer"
					onClick={handleChangeDescriptionSize}
					data-testid={'ProposalBlock__showMoreButton'}
				>
					{t(`pages.votingProposal.${showMore ? 'showLess' : 'showMore'}`)}
				</Label1>
			)}
			{attachment && (
				<img
					className="mt-4 rounded-lg lg:max-h-[260px] lg:max-w-[520px]"
					src={getOptimizedFileUrl(attachment || '')}
					data-testid={'ProposalBlock__image'}
				/>
			)}
			{isDemo && (
				<div className="bg-backgroundGrey mt-4 w-max rounded py-[6px] px-3">
					<SubHeading className="text-foregroundSecondary">{t('pages.votingProposal.createdBySuperdao')}</SubHeading>
				</div>
			)}
		</ProposalBlock>
	);
};
