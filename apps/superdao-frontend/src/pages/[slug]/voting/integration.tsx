import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';

import { daosRedirect } from 'src/utils/redirects';
import { CanCreateMoreDaoQuery, useCanCreateMoreDaoQuery, useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { getCurrentUserAsMember, getDaoWithRoles } from 'src/client/commonRequests';
import { VotingContainer, VotingProps } from 'src/features/snapshot/snapshot/container/votingContainer';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { isAdmin } from 'src/utils/roles';

const SnapshotIntegration: NextPageWithLayout<VotingProps> = ({ slug }) => {
	const { data: daoData } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug: dao } = daoData || {};

	if (!dao || !dao.isVotingEnabled) return null;

	return <VotingContainer slug={slug} />;
};

SnapshotIntegration.getLayout = getDaoLayout;

export default SnapshotIntegration;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const userID = ctx.req.session?.userId;
	const slug = ctx.params?.slug;
	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	const userAsMember = await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId: userID });
	if (!isAdmin(userAsMember?.role)) return { notFound: true };

	const { canCreateMoreDao } = queryClient.getQueryData<CanCreateMoreDaoQuery>(useCanCreateMoreDaoQuery.getKey())!;
	if (!canCreateMoreDao) {
		return daosRedirect;
	}

	return { props: { slug: dao.slug, ...getProps() } };
});
