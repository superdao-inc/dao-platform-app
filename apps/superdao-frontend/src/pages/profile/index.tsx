import { checkAuth, prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { UserUI } from 'src/features/user';
import { getProfileLayout, NextPageWithLayout } from 'src/layouts';
import { CustomHead } from 'src/components/head';

import { shrinkWallet } from '@sd/superdao-shared';
import { PATH_PROFILE_DAOS, PATH_PROFILE } from 'src/features/user/constants';
import { PublicUserFragment } from 'src/gql/user.generated';
import { PageContent } from 'src/components';
import { scanDaoIdsInBio } from 'src/utils/bio';
import { getDaoPreviewById, getUserDaoParticipation } from 'src/client/commonRequests';

type Props = {
	user: PublicUserFragment;
};

const UserPage: NextPageWithLayout<Props> = (props) => {
	const { user } = props;
	const { displayName, walletAddress, ens, avatar } = user;

	const name = displayName || shrinkWallet(ens || walletAddress);

	return (
		<PageContent>
			<CustomHead main={name} description={'User profile'} avatar={avatar} />

			<UserUI.UserProfile user={user} daosLinkPath={PATH_PROFILE_DAOS} nftsBackLinkPath={PATH_PROFILE} />
		</PageContent>
	);
};

UserPage.getLayout = getProfileLayout;

export default UserPage;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const [authRedirect, currentUser] = await checkAuth(ctx);
	if (authRedirect) return authRedirect;

	if (!currentUser) return { notFound: true };

	const [queryClient, getProps] = await prefetchData(ctx);

	const daoIdsInBio = currentUser?.bio ? scanDaoIdsInBio(currentUser.bio) : [];

	const { items } = (await getUserDaoParticipation(queryClient, ctx, { userId: currentUser.id })) || { items: [] };

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
			user: currentUser,
			isCurrentUser: true,
			...getProps()
		}
	};
});
