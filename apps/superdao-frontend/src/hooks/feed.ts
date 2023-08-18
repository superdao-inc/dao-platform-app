import { GetNextPageParamFunction } from 'react-query/types/core/types';
import { FeedQuery } from 'src/gql/post.generated';

const DEFAULT_LIMIT = 10;

export const feedOffsetGenerator: GetNextPageParamFunction<FeedQuery> = (lastPage, allPages) => {
	if (lastPage?.feed?.items?.length === DEFAULT_LIMIT) {
		return {
			offset: allPages.length * DEFAULT_LIMIT
		};
	}
};
