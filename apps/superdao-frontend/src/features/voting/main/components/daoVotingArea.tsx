import { useState } from 'react';
import { GetNextPageParamFunction } from 'react-query';

import { DaoVotingActions } from './daoVotingActions';
import { DaoProposals } from './daoProposals';

import { DaoVotingZone } from './daoVotingZone';
import { SnapshotProposalsQuery } from 'src/features/snapshot/snapshot/snaphost.generated';
import { SnapshotApi } from 'src/features/snapshot/API';
import { Space } from 'src/types/snapshot.generated';
import { GetAllProposalsQuery, useInfiniteGetAllProposalsQuery } from 'src/gql/proposal.generated';
import { ProposalStatus } from 'src/types/types.generated';
import { PageLoader } from 'src/components';

type Props = {
	daoId: string;
	slug: string;
	ensDomain: string | null;
	space: Space | undefined;
	isCreator: boolean;
};

const DEFAULT_LIMIT = 20;

// eslint-disable-next-line consistent-return
const snapshotProposalsOffsetGenerator: GetNextPageParamFunction<SnapshotProposalsQuery> = (lastPage, allPages) => {
	if (lastPage.proposals?.length === DEFAULT_LIMIT) {
		return {
			skip: allPages.length * DEFAULT_LIMIT
		};
	}
};

// eslint-disable-next-line consistent-return
const daoProposalsOffsetGenerator: GetNextPageParamFunction<GetAllProposalsQuery> = (lastPage, allPages) => {
	if (lastPage.proposals.items?.length === DEFAULT_LIMIT) {
		return {
			offset: allPages.length * DEFAULT_LIMIT
		};
	}
};

export const DaoVotingArea = ({ ensDomain, space, isCreator, daoId, slug }: Props) => {
	const [state, setState] = useState<ProposalStatus | null>(null);

	const { data, isLoading, fetchNextPage, hasNextPage, isRefetching } = SnapshotApi.useInfiniteSnapshotProposalsQuery(
		{
			first: DEFAULT_LIMIT,
			skip: 0,
			where: { space_in: [ensDomain], state },
			orderBy: 'created'
		},
		{
			keepPreviousData: true,
			getNextPageParam: snapshotProposalsOffsetGenerator,
			enabled: !!ensDomain
		}
	);

	const {
		data: daoVotingData,
		isLoading: isDaoVotingLoading,
		fetchNextPage: fetchDaoVotingNextPage,
		hasNextPage: hasDaoVotingNextPage,
		isRefetching: isDaoVotingRefetching
	} = useInfiniteGetAllProposalsQuery(
		{
			daoId,
			offset: 0,
			limit: DEFAULT_LIMIT,
			status: state
		},
		{
			keepPreviousData: true,
			getNextPageParam: daoProposalsOffsetGenerator
		}
	);

	const { pages } = data ?? {};
	const { pages: daoProposalsPages } = daoVotingData ?? {};

	const hasSuperdaoVotings = state || !!daoProposalsPages?.[0].proposals.count; // state checks if no filters selected
	const hasSnapshotVotings = state || (!!ensDomain && !!pages?.[0].proposals?.length); // state checks if no filters selected

	if (isLoading || isDaoVotingLoading || isRefetching || isDaoVotingRefetching) {
		return (
			<div className="pt-48">
				<PageLoader />
			</div>
		);
	}

	if (!hasSuperdaoVotings && !hasSnapshotVotings) {
		return (
			<div>
				<DaoVotingZone ensDomain={ensDomain} slug={slug} daoId={daoId} isCreator={isCreator} />
			</div>
		);
	}

	return (
		<div>
			<DaoVotingActions snapshotId={space?.id} isCreator={isCreator} slug={slug} daoId={daoId} />

			<DaoProposals
				daoId={daoId}
				slug={slug}
				isLoading={isLoading || isDaoVotingLoading}
				fetchNextPage={fetchNextPage}
				hasNextPage={hasNextPage}
				currentFilter={state}
				onFilter={setState}
				space={space}
				proposalsPages={pages ?? null}
				fetchDaoVotingNextPage={fetchDaoVotingNextPage}
				hasDaoVotingNextPage={hasDaoVotingNextPage}
				daoVotingProposals={daoProposalsPages ?? null}
				isCreator={isCreator}
			/>
		</div>
	);
};
