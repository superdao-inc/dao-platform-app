import styled from '@emotion/styled';
import { UseInfiniteQueryResult } from 'react-query';

import { Post } from 'src/components/feed/post';
import { EmptyFeed } from 'src/components/feed/feedComponents';
import { useInfiniteScroll } from 'src/hooks';
import { FeedQuery } from 'src/gql/post.generated';

type Props = {
	feedPages: FeedQuery[];
	queryHook: Omit<UseInfiniteQueryResult, 'data'>;
};

export const CommonFeed = (props: Props) => {
	const { feedPages, queryHook } = props;
	const { isLoading, hasNextPage, fetchNextPage } = queryHook;

	const [renderSentry] = useInfiniteScroll({ isLoading, hasNextPage, fetchNextPage });

	if (feedPages.length === 0 || feedPages[0].feed.items.length === 0) {
		return <EmptyFeed />;
	}

	return (
		<Wrapper>
			{feedPages.map(({ feed }) => {
				return feed.items.map((item) => <Post key={item.id} post={item} dao={item.dao} />);
			})}
			{renderSentry()}
		</Wrapper>
	);
};

const Wrapper = styled.div`
	& > *:not(:last-child) {
		margin-bottom: 16px;
	}
`;
