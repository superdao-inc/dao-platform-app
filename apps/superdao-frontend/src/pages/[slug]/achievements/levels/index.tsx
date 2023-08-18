import isMobile from 'is-mobile';
import { useTranslation } from 'next-i18next';
import { getDaoWithRoles } from 'src/client/commonRequests';
import { checkAuth, prefetchData, SSR } from 'src/client/ssr';
import { PageContent, Title1 } from 'src/components';
import { CustomHead } from 'src/components/head';
import { MobileHeader } from 'src/components/mobileHeader';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { LevelMapPageContent } from 'src/pagesComponents/achievements/levelmap/pageContent';
import { DaoMode } from 'src/types/types.generated';

type Props = {
	hostname: string;
	daoId: string;
	slug: string;
	isMobile: boolean;
	userId: string;
};

const LevelMap: NextPageWithLayout<Props> = (props: Props) => {
	const { slug, userId, isMobile } = props;

	const { t } = useTranslation();

	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug } = data || {};

	if (!daoBySlug) return null;

	return (
		<PageContent>
			<CustomHead
				main={daoBySlug?.name ?? ''}
				additional={'Leaderboard'}
				description={daoBySlug?.description ?? ''}
				avatar={daoBySlug?.avatar ?? null}
			/>
			<Title1 className="mb-6 hidden lg:flex">{t('pages.achievements.levels.title')}</Title1>
			<MobileHeader withBurger title={t('pages.achievements.levels.title')} />
			<LevelMapPageContent daoId={daoBySlug.id} userId={userId} isMobile={isMobile} />
		</PageContent>
	);
};

LevelMap.getLayout = getDaoLayout;

export default LevelMap;

export const getServerSideProps = SSR(async (ctx) => {
	const slug = ctx.params?.slug;
	const userId = ctx.req.session?.userId;
	if (typeof slug !== 'string') return { notFound: true };

	const [authRedirect] = await checkAuth(ctx);
	if (authRedirect) return authRedirect;

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };
	if (dao.mode !== DaoMode.Achievements) return { notFound: true };

	return {
		props: {
			slug: dao.slug,
			daoId: dao.id,
			isMobile: isMobile({ ua: ctx.req }),
			userId,
			...getProps()
		}
	};
});
