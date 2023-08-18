import { checkAuth, prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { UserUI } from 'src/features/user';
import { getProfileLayout, NextPageWithLayout } from 'src/layouts';
import { PATH_PROFILE } from 'src/features/user/constants';
import { getDaoPreviewById, getUserDaoParticipation } from 'src/client/commonRequests';

type Props = {
	slug: string;
	userId: string;
};

const UserDaosPage: NextPageWithLayout<Props> = (props) => {
	return <UserUI.UserDaos backPath={PATH_PROFILE} {...props} />;
};

UserDaosPage.getLayout = getProfileLayout;

export default UserDaosPage;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const [, currentUser] = await checkAuth(ctx);

	const [queryClient, getProps] = await prefetchData(ctx);

	const { items } = (await getUserDaoParticipation(queryClient, ctx, { userId: currentUser!.id })) || { items: [] };

	await Promise.all(
		items.map(async (daoParticipation) => {
			await getDaoPreviewById(queryClient, ctx, { id: daoParticipation.daoId });
		})
	);

	return {
		props: {
			slug: currentUser!.slug || currentUser!.id,
			userId: currentUser!.id,
			isCurrentUser: true,
			...getProps()
		}
	};
});
