import { shrinkWallet } from '@sd/superdao-shared';

import { checkAuth, prefetchData, SSR } from 'src/client/ssr';
import { getDaoPreviewById, getUserByIdOrSlug, getUserDaoParticipation } from 'src/client/commonRequests';
import { UserUI } from 'src/features/user';
import { NextPageWithLayout } from 'src/layouts';
import { getUserLayout } from 'src/layouts/user';
import { CustomHead } from 'src/components/head';
import { PageContent } from 'src/components';
import { PublicUserFragment } from 'src/gql/user.generated';
import { scanDaoIdsInBio } from 'src/utils/bio';

type Props = {
	user: PublicUserFragment;
};

const UserPage: NextPageWithLayout<Props> = (props) => {
	const { user } = props;
	const { id, slug, displayName, avatar, walletAddress, ens } = user;

	const name = displayName || shrinkWallet(ens || walletAddress);

	return (
		<PageContent>
			<CustomHead main={name} description={'User profile'} avatar={avatar} />

			<UserUI.UserProfile
				user={user}
				daosLinkPath={`/users/${slug || id}/daos`}
				nftsBackLinkPath={`/users/${slug || id}`}
			/>
		</PageContent>
	);
};

UserPage.getLayout = getUserLayout;

export default UserPage;

export const getServerSideProps = SSR(async (ctx) => {
	const idOrSlug = ctx.params?.idOrSlug;
	if (typeof idOrSlug !== 'string') return { notFound: true };

	const [, currentUser] = await checkAuth(ctx);

	const [queryClient, getProps] = await prefetchData(ctx);

	const userByIdOrSlug = await getUserByIdOrSlug(queryClient, ctx, { idOrSlug });
	if (!userByIdOrSlug) return { notFound: true };

	const isCurrentUser = userByIdOrSlug.id === currentUser?.id;

	if (isCurrentUser) {
		return {
			redirect: {
				destination: '/profile',
				permanent: false
			}
		};
	}

	const daoIdsInBio = userByIdOrSlug?.bio ? scanDaoIdsInBio(userByIdOrSlug.bio) : [];

	const { items } = (await getUserDaoParticipation(queryClient, ctx, { userId: userByIdOrSlug.id })) || { items: [] };

	await Promise.allSettled([
		// first 4 preview daos
		Promise.all(
			items.slice(4).map(async (daoParticipation) => {
				await getDaoPreviewById(queryClient, ctx, { id: daoParticipation.daoId });
			})
		),
		// daos in bio
		Promise.allSettled(
			daoIdsInBio.map(async (daoId) => {
				await getDaoPreviewById(queryClient, ctx, { id: daoId });
			})
		)
	]);

	return {
		props: {
			user: userByIdOrSlug,
			isCurrentUser,
			...getProps()
		}
	};
});
