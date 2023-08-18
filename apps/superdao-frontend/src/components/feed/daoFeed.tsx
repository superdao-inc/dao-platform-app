import { UseInfiniteQueryResult } from 'react-query';
import { FeedWrapper, EmptyFeed } from './feedComponents';

import { InvitationPost } from './customPosts/invitationPost';
import { useInfiniteScroll } from 'src/hooks';
import { Post } from 'src/components/feed/post';
import { DaoMemberRole } from 'src/types/types.generated';
import { PublicDaoFragment } from 'src/gql/daos.generated';
import { FeedQuery } from 'src/gql/post.generated';
import { UserAPI } from 'src/features/user/API';
import { isAdmin } from 'src/utils/roles';

type Props = {
	feedPages: FeedQuery[];
	daoData: PublicDaoFragment;
	publicLink: string;
	queryHook: Omit<UseInfiniteQueryResult, 'data'>;
};

export const DaoFeed = (props: Props) => {
	const { feedPages, daoData, publicLink, queryHook } = props;
	const { isLoading, hasNextPage, fetchNextPage } = queryHook;

	const { data: roleData } = UserAPI.useCurrentUserMemberRoleQuery({ daoId: daoData.id });
	const { currentUserMemberRole } = roleData || {};

	const [renderSentry] = useInfiniteScroll({ isLoading, hasNextPage, fetchNextPage });

	if (Number(feedPages?.[0].feed.count) === 0 && currentUserMemberRole === DaoMemberRole.Member) {
		return <EmptyFeed />;
	}

	return (
		<FeedWrapper>
			{feedPages.map((page) => {
				return page.feed.items.map((item) => <Post key={item.id} post={item} dao={item.dao} />);
			})}

			{renderSentry()}

			{isAdmin(currentUserMemberRole) && <InvitationPost dao={daoData} publicLink={`https://${publicLink}`} />}
		</FeedWrapper>
	);
};
