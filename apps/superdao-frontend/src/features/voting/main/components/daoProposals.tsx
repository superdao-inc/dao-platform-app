import { useTranslation } from 'next-i18next';
import styled from '@emotion/styled';
import { useState, MouseEvent, useEffect } from 'react';
import { useRouter } from 'next/router';

import { SnapshotProposal } from './snapshotProposal';
import { DaoProposal } from './daoProposal';

import { SnapshotProposalsQuery } from 'src/features/snapshot/snapshot/snaphost.generated';
import { ProposalCreationType } from 'src/features/snapshot/snapshot.types';
import { PageLoader, Button, ActionBlock, SnapshotIcon } from 'src/components';
import { Space } from 'src/types/snapshot.generated';
import { colors } from 'src/style';
import { useInfiniteScroll } from 'src/hooks';
import { ProposalStatus } from 'src/types/types.generated';
import { GetAllProposalsQuery } from 'src/gql/proposal.generated';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { AuthAPI } from 'src/features/auth/API';

const getSnapshotHintLsKey = (daoId?: string) => (daoId ? `snapshotHintClosed:${daoId}` : undefined);

type Props = {
	proposalsPages: SnapshotProposalsQuery[] | null;
	daoVotingProposals: GetAllProposalsQuery[] | null;
	space: Space | undefined;
	daoId: string;
	slug: string;
	isLoading: boolean;
	fetchNextPage: any;
	hasNextPage: boolean | undefined;
	fetchDaoVotingNextPage: any;
	hasDaoVotingNextPage: boolean | undefined;
	currentFilter: ProposalStatus | null;
	onFilter: (filter: ProposalStatus | null) => void;
	isCreator: boolean;
};

export const DaoProposals = ({
	proposalsPages,
	daoVotingProposals,
	daoId,
	slug,
	space,
	isLoading,
	fetchDaoVotingNextPage,
	hasDaoVotingNextPage,
	fetchNextPage,
	hasNextPage,
	currentFilter,
	onFilter,
	isCreator
}: Props) => {
	const { t } = useTranslation();
	const { push } = useRouter();
	const isAuthorized = AuthAPI.useIsAuthorized();

	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug: daoData } = data || {};

	const [renderSentry] = useInfiniteScroll({
		isLoading,
		hasNextPage: hasNextPage || hasDaoVotingNextPage,
		fetchNextPage: () => {
			if (hasNextPage) {
				fetchNextPage();
			}
			if (hasDaoVotingNextPage) {
				fetchDaoVotingNextPage();
			}
		}
	});

	const [isSnapshotHintVisible, setIsSnapshotHintVisible] = useState(false);
	const snapshotKeyLsKey = getSnapshotHintLsKey(daoData?.id || '');
	useEffect(() => {
		if (snapshotKeyLsKey) {
			const isSnapShotKeyClosed = Boolean(localStorage.getItem(snapshotKeyLsKey));

			setIsSnapshotHintVisible(!isSnapShotKeyClosed);
		}
	}, [snapshotKeyLsKey]);

	const handleCloseSnapshotHint = (e: MouseEvent) => {
		e.stopPropagation();
		setIsSnapshotHintVisible(false);

		if (snapshotKeyLsKey) localStorage.setItem(snapshotKeyLsKey, '!');
	};

	const proposals =
		proposalsPages
			?.map(({ proposals }) =>
				proposals?.map((proposal) => ({
					...proposal,
					type: ProposalCreationType.snapshot
				}))
			)
			.flat() ?? [];

	const daoProposals =
		daoVotingProposals
			?.map(({ proposals }) =>
				proposals?.items.map((proposal) => ({
					...proposal,
					type: ProposalCreationType.dao
				}))
			)
			.flat() ?? [];

	let mixedProposals: any[] = [];

	if (proposals?.length) {
		mixedProposals = mixedProposals.concat(proposals);
	}
	if (daoProposals?.length) {
		mixedProposals = mixedProposals.concat(daoProposals);
	}

	const getProposalStatus = (currentDate: number, startDate: number, endDate: number): ProposalStatus => {
		if (startDate > currentDate) return ProposalStatus.Pending;
		if (endDate < currentDate) return ProposalStatus.Closed;
		return ProposalStatus.Active;
	};

	mixedProposals.sort((a: any, b: any) => {
		const currentDate = new Date().getTime() / 1000;
		const aStartDate = a.type === ProposalCreationType.snapshot ? a.start : new Date(a.startAt).getTime() / 1000;
		const bStartDate = b.type === ProposalCreationType.snapshot ? b.start : new Date(b.startAt).getTime() / 1000;
		const aEndDate = a.type === ProposalCreationType.snapshot ? a.end : new Date(a.endAt).getTime() / 1000;
		const bEndDate = b.type === ProposalCreationType.snapshot ? b.end : new Date(b.endAt).getTime() / 1000;
		const aStatus = getProposalStatus(currentDate, aStartDate, aEndDate);
		const bStatus = getProposalStatus(currentDate, bStartDate, bEndDate);

		// sort proposals by endDate but put active proposals first, pending proposals second and closed proposals last
		if (aStatus === bStatus) {
			return aEndDate - bEndDate;
		}
		if (aStatus === ProposalStatus.Active) {
			return -1;
		}
		if (bStatus === ProposalStatus.Active) {
			return 1;
		}
		if (aStatus === ProposalStatus.Pending) {
			return -1;
		}
		if (bStatus === ProposalStatus.Pending) {
			return 1;
		}
		return 0;
	});

	const filters = [
		{
			label: t('components.dao.voting.filter.all'),
			onClick: () => onFilter(null),
			activeValue: null
		},
		{
			label: t('components.dao.voting.filter.active'),
			onClick: () => onFilter(ProposalStatus.Active),
			activeValue: ProposalStatus.Active
		},
		{
			label: t('components.dao.voting.filter.upcoming'),
			onClick: () => onFilter(ProposalStatus.Pending),
			activeValue: ProposalStatus.Pending
		},
		{
			label: t('components.dao.voting.filter.closed'),
			onClick: () => onFilter(ProposalStatus.Closed),
			activeValue: ProposalStatus.Closed
		}
	];

	if (!daoData) return null;

	const { ensDomain, isVotingEnabled } = daoData;

	const proposalsContent = mixedProposals?.length ? (
		<div>
			{mixedProposals.map((proposal: any) => {
				if (proposal.type === ProposalCreationType.snapshot) {
					return <SnapshotProposal key={proposal.id} daoId={daoId} proposal={proposal} space={space} />;
				}
				return <DaoProposal key={proposal.id} daoId={daoId} slug={slug} proposal={proposal} />;
			})}
		</div>
	) : (
		<EmptyPlug>{t('components.dao.voting.plug', { filter: currentFilter === null ? '' : currentFilter })}</EmptyPlug>
	);

	return (
		<div>
			<FilterWrapper>
				{filters.map(({ label, activeValue, onClick }) => {
					const isActive = activeValue === currentFilter;

					return (
						<FilterButton
							key={label}
							color={isActive ? 'accentPrimary' : 'overlaySecondary'}
							size="md"
							onClick={onClick}
							label={label}
							data-testid={`ProposalsPage__filter${label}`}
						/>
					);
				})}
			</FilterWrapper>

			<ActionBlock
				onClick={() => push(`/${slug}/voting/integration`)}
				className="my-4 px-4 py-4 hover:cursor-pointer"
				isOpen={isSnapshotHintVisible && isVotingEnabled && !ensDomain && isAuthorized && isCreator}
				onClose={handleCloseSnapshotHint}
				title={t('components.dao.snapshot.hint.title')}
				subtitle={t('components.dao.snapshot.hint.subtitle')}
				icon={<SnapshotIcon width={40} height={40} />}
				iconWithoutBackground
			/>

			{isLoading ? (
				<PageLoader />
			) : (
				<>
					{proposalsContent}
					{renderSentry()}
				</>
			)}
		</div>
	);
};

const EmptyPlug = styled.div`
	background: ${colors.backgroundSecondary};
	border-radius: 8px;
	padding: 20px 24px;
	color: ${colors.foregroundSecondary};
`;

const FilterWrapper = styled.div`
	display: flex;
	align-items: center;
	gap: 12px;
	margin-top: 20px;
	margin-bottom: 16px;
`;

const FilterButton = styled(Button)`
	border-radius: 100px;
`;
