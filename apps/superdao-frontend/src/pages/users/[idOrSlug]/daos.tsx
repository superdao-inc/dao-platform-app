import { checkAuth, prefetchData, SSR } from 'src/client/ssr';
import { getDaoPreviewById, getUserByIdOrSlug, getUserDaoParticipation } from 'src/client/commonRequests';
import { UserUI } from 'src/features/user';
import { NextPageWithLayout } from 'src/layouts';
import { getUserLayout } from 'src/layouts/user';

type Props = {
	slug: string;
	userId: string;
};

const UserDaosPage: NextPageWithLayout<Props> = (props) => {
	return <UserUI.UserDaos backPath={`/users/${props.slug || props.userId}`} {...props} />;
};

UserDaosPage.getLayout = getUserLayout;

export default UserDaosPage;

export const getServerSideProps = SSR(async (ctx) => {
	const idOrSlug = ctx.params?.idOrSlug;
	if (typeof idOrSlug !== 'string') return { notFound: true };

	const [, currentUser] = await checkAuth(ctx);

	const [queryClient, getProps] = await prefetchData(ctx);

	const userByIdOrSlug = await getUserByIdOrSlug(queryClient, ctx, { idOrSlug });
	if (!userByIdOrSlug) return { notFound: true };

	const { items } = (await getUserDaoParticipation(queryClient, ctx, { userId: userByIdOrSlug.id })) || { items: [] };

	await Promise.all(
		items.map(async (daoParticipation) => {
			await getDaoPreviewById(queryClient, ctx, { id: daoParticipation.daoId });
		})
	);

	const isCurrentUser = userByIdOrSlug.id === currentUser?.id;

	if (isCurrentUser) {
		return {
			redirect: {
				destination: '/profile/daos',
				permanent: false
			}
		};
	}

	return {
		props: {
			slug: idOrSlug,
			userId: userByIdOrSlug.id,
			...getProps()
		}
	};
});
