import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';

import styled from '@emotion/styled';

import { feedOffsetGenerator, useToggle } from 'src/hooks';
import { CommonFeed, PageContent, PostCreatingSuggestion, Title1 } from 'src/components';
import { generateInfinitePage, prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { CreatePostModal } from 'src/components/modals/postModals/createPostModal';
import { FeedQuery, useFeedQuery, useInfiniteFeedQuery } from 'src/gql/post.generated';
import { UserAPI } from 'src/features/user/API';
import { CustomHead } from 'src/components/head';
import { paginatedResponsePlaceholder } from '@sd/superdao-shared';
import { isAdmin } from 'src/utils/roles';

const Index: NextPage<{ userId: string }> = ({ userId }) => {
	const { t } = useTranslation();
	const [isPostingModalOpen, togglePostingModel] = useToggle();

	const { data: feedData, ...feedHook } = useInfiniteFeedQuery(
		{ offset: 0, daoId: null },
		{
			keepPreviousData: true,
			getNextPageParam: feedOffsetGenerator
		}
	);
	const { pages: feedPages } = feedData || {};
	const { data } = UserAPI.useUserDaoParticipationQuery({ userId }) || {};
	const { daoParticipation: userDaosData } = data || {};

	if (!feedPages || !userDaosData) return null;

	const isPostingAvailable = userDaosData.items.some((item) => isAdmin(item.role));

	return (
		<PageContent>
			<CustomHead main={'Feed'} additional={'Superdao'} description={'Feed'} />

			<Title1 className="mb-6">{t('pages.feed.title')}</Title1>

			{isPostingAvailable && (
				<PostingWrapper>
					<PostCreatingSuggestion onClick={togglePostingModel} />
					<CreatePostModal hasDaoSelector isOpen={isPostingModalOpen} onClose={togglePostingModel} />
				</PostingWrapper>
			)}
			<CommonFeed feedPages={feedPages} queryHook={feedHook} />
		</PageContent>
	);
};

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const userId = ctx.req.session?.userId;
	const [queryClient, getProps] = await prefetchData(ctx);

	const { feed } = (await useFeedQuery.fetcher()()) || {};

	if (feed) {
		const paginatedData = generateInfinitePage<FeedQuery>('feed', feed);
		queryClient.setQueryData(useFeedQuery.getKey(), paginatedData);
	} else {
		const paginatedData = generateInfinitePage<FeedQuery>('feed', paginatedResponsePlaceholder());
		queryClient.setQueryData(useFeedQuery.getKey(), paginatedData);
	}

	return { props: getProps(), userId };
});

export default Index;

const PostingWrapper = styled.div`
	margin-top: -8px;
	margin-bottom: 16px;
`;
