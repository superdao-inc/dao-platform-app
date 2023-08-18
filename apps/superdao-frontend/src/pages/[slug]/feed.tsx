import styled from '@emotion/styled';

import { useTranslation } from 'next-i18next';
import { SSR, prefetchData } from 'src/client/ssr';

import { feedOffsetGenerator, useToggle } from 'src/hooks';

import {
	DaoFeed,
	PageContent,
	PostCreatingSuggestion,
	CreatePostModal,
	Title1,
	PlusIcon,
	IconButton
} from 'src/components';
import { DaoMemberZone } from 'src/pagesComponents/dao/daoMemberZone';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { getCurrentUserAsMember, getDaoWithRoles } from 'src/client/commonRequests';
import { useFeedQuery, useInfiniteFeedQuery } from 'src/gql/post.generated';
import { AuthAPI } from 'src/features/auth/API';
import { UserAPI } from 'src/features/user/API';
import { CustomHead } from 'src/components/head';
import { paginatedResponsePlaceholder } from '@sd/superdao-shared';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { isAdmin } from 'src/utils/roles';
import { MobileHeader } from 'src/components/mobileHeader';

type Props = {
	slug: string;
	daoId: string;
	hostname: string;
};

const DaoFeedPage: NextPageWithLayout<Props> = (props) => {
	const { slug, daoId, hostname } = props;

	const { t } = useTranslation();

	const [isPostingModalOpen, togglePostingModal] = useToggle();

	const isAuthorized = AuthAPI.useIsAuthorized();
	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug } = data || {};

	const { data: daoFeedData, ...feedHook } = useInfiniteFeedQuery(
		{ daoId, offset: 0 },
		{
			keepPreviousData: true,
			getNextPageParam: feedOffsetGenerator
		}
	);
	const { pages: daoFeedPages } = daoFeedData || {};

	const { data: memberRoleData } = UserAPI.useCurrentUserMemberRoleQuery({ daoId });
	const { currentUserMemberRole } = memberRoleData || {};

	if (!daoBySlug) return null;
	const { name, description, avatar } = daoBySlug;

	if (!currentUserMemberRole || !isAuthorized) {
		return (
			<PageContent>
				<CustomHead main={name} additional={'Feed'} description={description} avatar={avatar} />

				<MobileHeader withBurger title={t('pages.feed.title')} />

				<Title1 className="mb-6 hidden lg:block">{t('pages.feed.title')}</Title1>

				<DaoMemberZone isAuthorized={isAuthorized} whitelistUrl={daoBySlug.whitelistUrl} />
			</PageContent>
		);
	}

	if (!daoFeedPages) return null;

	const isPostingAvailable = isAdmin(currentUserMemberRole);
	const publicLink = `${hostname}/${slug}`;

	return (
		<PageContent>
			<CustomHead main={name} additional={'Feed'} description={description} avatar={avatar} />

			<MobileHeader
				withBurger
				title={t('pages.feed.title')}
				right={
					isPostingAvailable && (
						<IconButton icon={<PlusIcon fill="white" />} color="accentPrimary" size="md" onClick={togglePostingModal} />
					)
				}
			/>
			<Title1 className="mb-6 hidden lg:block">{t('pages.feed.title')}</Title1>

			{isPostingAvailable && (
				<PostingWrapper>
					<PostCreatingSuggestion className="hidden lg:flex" onClick={togglePostingModal} dao={daoBySlug} />

					<CreatePostModal
						hasDaoSelector={false}
						daoId={daoId}
						isOpen={isPostingModalOpen}
						onClose={togglePostingModal}
					/>
				</PostingWrapper>
			)}

			<DaoFeed feedPages={daoFeedPages} daoData={daoBySlug} publicLink={publicLink} queryHook={feedHook} />
		</PageContent>
	);
};

DaoFeedPage.getLayout = getDaoLayout;

export const getServerSideProps = SSR(async (ctx) => {
	const slug = ctx.params?.slug;
	const userId = ctx.req.session?.userId;

	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	if (isAuthorized) {
		const headers = { cookie: ctx.req.headers.cookie || '' };
		const daoVariables = { daoId: dao.id, offset: 0 };

		const { feed } = (await useFeedQuery.fetcher(daoVariables, headers)()) || {};
		queryClient.setQueryData(useInfiniteFeedQuery.getKey(daoVariables), { pages: [{ feed }], pageParams: [0] });

		await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId });
	} else {
		queryClient.setQueryData(UserAPI.useUserAsMemberQuery.getKey({ daoId: dao.id, userId }), null);
		queryClient.setQueryData(useInfiniteFeedQuery.getKey({ daoId: dao.id, offset: 0 }), paginatedResponsePlaceholder());
	}

	return {
		props: {
			slug: dao.slug,
			daoId: dao.id,
			...getProps()
		}
	};
});

export default DaoFeedPage;

const PostingWrapper = styled.div`
	margin-bottom: 16px;
`;
