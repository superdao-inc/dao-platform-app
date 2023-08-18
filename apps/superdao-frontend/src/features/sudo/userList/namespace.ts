import { GetNextPageParamFunction } from 'react-query';
import { AllUsersQuery } from 'src/gql/user.generated';

export const RepoParams = {
	overview: {
		offset: 0,
		limit: 20
	}
};

export const paginationOffsetGenerator: GetNextPageParamFunction<AllUsersQuery> = (lastPage, allPages) =>
	lastPage.allUsers.items.length === RepoParams.overview.limit
		? {
				offset: allPages.length * RepoParams.overview.limit
		  }
		: undefined;
