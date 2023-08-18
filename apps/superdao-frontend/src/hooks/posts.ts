import { useQueryClient } from 'react-query';

import { useTranslation } from 'next-i18next';
import { toast } from 'src/components/toast/toast';
import {
	CreatePostMutation,
	useInfiniteFeedQuery,
	FeedQuery,
	EditPostMutation,
	DeletePostMutationVariables
} from 'src/gql/post.generated';

type InfiniteQueryType<T = unknown> = {
	pages: T[];
	pageParams: number[];
};

export const useCreatePostSuccess = () => {
	const queryClient = useQueryClient();
	const { t } = useTranslation();

	return async (result: CreatePostMutation) => {
		const { createPost: post } = result || {};

		const { daoId } = post || {};
		const feedKey = useInfiniteFeedQuery.getKey({ daoId: daoId || null, offset: 0 });
		const data = queryClient.getQueryData<InfiniteQueryType<FeedQuery>>(feedKey);
		const { pages: daoFeedPages } = data || {};

		if (daoFeedPages) {
			daoFeedPages[0].feed.items.unshift(post);
			const items = daoFeedPages.map(({ feed }) => feed.items).flat();

			queryClient.setQueryData<InfiniteQueryType<FeedQuery>>(feedKey, {
				pages: [{ feed: { count: items.length, items } }],
				pageParams: [0]
			});
		}

		toast(t('components.post.confirmations.postCreated'));
	};
};

export const useEditPostSuccess = () => {
	const queryClient = useQueryClient();
	const { t } = useTranslation();

	return async (result: EditPostMutation) => {
		const { editPost } = result;

		const updatePostInQuery = (data?: InfiniteQueryType<FeedQuery>) => {
			if (!data) return { pages: [], pageParams: [] };

			const pages = data.pages.map(({ feed }) => {
				const items = feed.items.map((item) => {
					if (item.id === editPost.id) return editPost;
					return item;
				});

				return {
					feed: {
						count: feed.count,
						items
					}
				};
			});

			return { pages, pageParams: data.pageParams };
		};

		const { daoId } = editPost || {};
		const daoFeedKey = useInfiniteFeedQuery.getKey({ daoId: daoId || null, offset: 0 });
		queryClient.setQueryData<InfiniteQueryType<FeedQuery>>(daoFeedKey, updatePostInQuery);

		toast(t('components.post.confirmations.postUpdated'));
	};
};

export const useDeletePostSuccess = (daoId: string) => {
	const queryClient = useQueryClient();
	const { t } = useTranslation();

	return async (_: any, params: DeletePostMutationVariables) => {
		const {
			deletePostData: { postId }
		} = params;

		const deletePostFromQuery = (data?: InfiniteQueryType<FeedQuery>) => {
			if (!data) return { pages: [], pageParams: [] };

			const pages = data.pages.map(({ feed }) => {
				const items = feed.items.filter((item) => {
					return item.id !== postId;
				});

				return {
					feed: {
						count: feed.count,
						items
					}
				};
			});

			return { pages, pageParams: data.pageParams };
		};

		const daoFeedKey = useInfiniteFeedQuery.getKey({ daoId, offset: 0 });
		queryClient.setQueryData<InfiniteQueryType<FeedQuery>>(daoFeedKey, deletePostFromQuery);

		toast(t('components.post.confirmations.postDeleted'));
	};
};
