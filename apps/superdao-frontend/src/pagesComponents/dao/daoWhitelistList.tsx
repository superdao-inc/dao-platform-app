import { UseInfiniteQueryResult } from 'react-query';
import { useMemo } from 'react';

import { DaoWhitelistRow } from './daoWhitelistRow';
import { MembersLoader } from './membersLoader';
import { useInfiniteScroll } from 'src/hooks';
import { DaoMemberRole } from 'src/types/types.generated';
import { GetDaoWhitelistQuery } from 'src/gql/whitelist.generated';
// import { UserAPI } from 'src/features/user/API';

type Props = {
	daoWhitelist: GetDaoWhitelistQuery[];
	daoId: string;
	daoAddress: string;
	currentUserMemberRole: DaoMemberRole;
	queryHook: Omit<UseInfiniteQueryResult, 'data'>;
};

export const DaoWhitelistList = (props: Props) => {
	const { daoWhitelist, currentUserMemberRole, daoId, queryHook, daoAddress } = props;
	const { isLoading, isFetching, hasNextPage, fetchNextPage } = queryHook;

	const [renderSentry] = useInfiniteScroll({
		isLoading: isLoading || isFetching,
		hasNextPage,
		fetchNextPage
	});
	const daoWhitelistItems = useMemo(
		() => daoWhitelist.map((page) => page.getDaoWhitelist.items).flat(),
		[daoWhitelist]
	);

	return (
		<div className="overflow-auto">
			{daoWhitelistItems.map((member) => (
				<DaoWhitelistRow
					key={member.id}
					member={member}
					currentUserMemberRole={currentUserMemberRole}
					daoAddress={daoAddress}
					daoId={daoId}
				/>
			))}
			{renderSentry(<MembersLoader />)}
		</div>
	);
};
