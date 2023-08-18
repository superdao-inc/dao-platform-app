import { UseInfiniteQueryResult } from 'react-query';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useEffect, useState } from 'react';
import throttle from 'lodash/throttle';

import { DESKTOP_BREAKPOINT } from 'src/constants';

import { DaoMemberRow } from 'src/pagesComponents/dao/daoMemberRow';
import { DaoWhitelistRow } from 'src/pagesComponents/dao/daoWhitelistRow';
import { MembersLoader } from './membersLoader';
import { DaoMemberRole } from 'src/types/types.generated';
import { PublicDaoMembershipFragment } from 'src/gql/daoMembership.generated';
import { UserAPI } from 'src/features/user/API';
import { PublicWhitelistFragment, useUpdateWhitelistStatusMutation } from 'src/gql/whitelist.generated';
import { useCollectionTiersById } from 'src/hooks/useCollectionTiers';
import { useGrantMemberRole, useRevokeMemberRole } from 'src/hooks';
import { DaoWhitelistEmailsRow } from './daoWhitelistEmailsRow';
import { getTiersNames } from 'src/utils/tiers';

//TODO
type Props = {
	daoMembers?: PublicDaoMembershipFragment[];
	daoWhitelists?: PublicWhitelistFragment[];
	daoId: string;
	daoSlug: string;
	daoAddress: string;
	currentUserMemberRole?: DaoMemberRole;
	queryHook: Pick<UseInfiniteQueryResult, 'hasNextPage' | 'fetchNextPage'>;
	typeList: 'members' | 'whitelist' | 'email';
	creatorExist?: boolean;
};

const SCROLLABLE_MEMBERS_LIST = 'membersListScrollable';

export const DaoMembersList = (props: Props) => {
	const {
		daoMembers,
		daoWhitelists,
		currentUserMemberRole,
		daoId,
		daoSlug,
		queryHook,
		daoAddress,
		typeList,
		creatorExist
	} = props;

	const { hasNextPage = false, fetchNextPage } = queryHook;

	const scrollableId = useScrollableId();

	const { data: user } = UserAPI.useCurrentUserQuery();
	const { currentUser: currentUserData } = user || {};

	const { mutate: grantMemberRole } = useGrantMemberRole();
	const { mutate: revokeMemberRole } = useRevokeMemberRole();
	//для email записей, по хорошему в этот компонент вынести все такие методы бан и т.д, сейчас они в banMemberModal
	const { mutate: deactivateLink } = useUpdateWhitelistStatusMutation();

	const tiers = useCollectionTiersById(daoAddress);
	const listByType = typeList === 'members' ? daoMembers : daoWhitelists;
	if (!listByType) return null;

	const changeRoleActions = {
		grant: grantMemberRole,
		revoke: revokeMemberRole
	};

	return (
		<div
			id={scrollableId}
			className="mobile-has-more-content scrollbar-hide lg:desktop-has-more-content relative overflow-scroll"
		>
			<InfiniteScroll
				dataLength={listByType.length}
				next={fetchNextPage}
				hasMore={hasNextPage}
				loader={<MembersLoader />}
				scrollableTarget={scrollableId}
			>
				{listByType.map((member) => {
					switch (typeList) {
						case 'whitelist': {
							return (
								<DaoWhitelistRow
									key={member.id}
									member={member as PublicWhitelistFragment}
									currentUserMemberRole={currentUserMemberRole}
									daoAddress={daoAddress}
									daoId={daoId}
									tiers={tiers}
								/>
							);
						}

						case 'email': {
							return (
								<DaoWhitelistEmailsRow
									key={member.id}
									member={member as PublicWhitelistFragment}
									currentUserMemberRole={currentUserMemberRole}
									daoAddress={daoAddress}
									daoId={daoId}
									tiers={tiers}
									action={deactivateLink}
								/>
							);
						}

						case 'members': {
							const namedTiers = getTiersNames(tiers, member.tiers);
							const isClaimed = (member as PublicDaoMembershipFragment).user.isClaimed;

							return (
								<DaoMemberRow
									key={member.id}
									daoId={daoId}
									daoSlug={daoSlug}
									member={member as PublicDaoMembershipFragment}
									tiers={namedTiers}
									currentUserMemberRole={currentUserMemberRole}
									currentUserId={currentUserData?.id}
									daoAddress={daoAddress}
									isClaimed={isClaimed}
									creatorExist={!!creatorExist}
									changeRoleActions={changeRoleActions}
								/>
							);
						}
					}
				})}
			</InfiniteScroll>
		</div>
	);
};

function useScrollableId() {
	const [scrollableId, setScrollableId] = useState<string | undefined>(SCROLLABLE_MEMBERS_LIST);

	useEffect(() => {
		const updateScrollableId = () => {
			if (window.innerWidth < DESKTOP_BREAKPOINT && scrollableId === SCROLLABLE_MEMBERS_LIST) {
				setScrollableId(undefined);
			} else if (window.innerWidth >= DESKTOP_BREAKPOINT && !scrollableId) {
				setScrollableId(SCROLLABLE_MEMBERS_LIST);
			}
		};

		const debouncedHandleResize = throttle(function handleResize() {
			updateScrollableId();
		}, 250);

		window.addEventListener('resize', debouncedHandleResize);
		updateScrollableId();

		return () => {
			window.removeEventListener('resize', debouncedHandleResize);
		};
	}, [scrollableId]);

	return scrollableId;
}
