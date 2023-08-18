import { GetNextPageParamFunction } from 'react-query';
import { AllDaosQuery } from 'src/gql/daos.generated';
import { SortOrder, SortProperty } from 'src/types/types.generated';

export const paginationOffsetGenerator: GetNextPageParamFunction<AllDaosQuery> = (lastPage, allPages) =>
	lastPage.allDaos.items.length === RepoParams.overview.limit
		? {
				offset: allPages.length * RepoParams.overview.limit
		  }
		: undefined;

export const RepoParams = {
	overview: {
		offset: 0,
		limit: 20,
		sortOrder: SortOrder.Asc,
		sortProperty: SortProperty.Name
	}
};
