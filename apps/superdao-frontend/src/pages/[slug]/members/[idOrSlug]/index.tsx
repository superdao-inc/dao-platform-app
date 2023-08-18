import { useCallback } from 'react';
import { useRouter } from 'next/router';

import { shrinkWallet } from '@sd/superdao-shared';

import { checkAuth, prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { getDaoPreviewById, getUserByIdOrSlug, getUserDaoParticipation } from 'src/client/commonRequests';
import { UserUI } from 'src/features/user';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { CustomHead } from 'src/components/head';
import { PublicUserFragment } from 'src/gql/user.generated';
import { PageContent } from 'src/components';
import { getIsValueProvided } from 'src/utils/texts';
import { scanDaoIdsInBio } from 'src/utils/bio';

type Props = {
	user: PublicUserFragment;
};

const DaoMemberPage: NextPageWithLayout<Props> = (props) => {
	const { user } = props;
	const { id, slug, displayName, avatar, walletAddress, ens } = user;

	const name = displayName || shrinkWallet(ens || walletAddress);

	const { push, back, query } = useRouter();
	const { slug: daoSlug, fromNft } = query;

	const handleBack = useCallback(() => {
		if (getIsValueProvided(fromNft)) {
			back();
			return;
		}
		push(`/${daoSlug}/members`);
	}, [back, daoSlug, fromNft, push]);

	return (
		<PageContent onBack={handleBack}>
			<CustomHead main={name} description={'User profile'} avatar={avatar} />

			<UserUI.UserProfile
				user={user}
				isDaoTab
				daosLinkPath={`/users/${slug || id}/daos`}
				nftsBackLinkPath={`/users/${slug || id}`}
			/>
		</PageContent>
	);
};

DaoMemberPage.getLayout = getDaoLayout;

export default DaoMemberPage;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const idOrSlug = ctx.params?.idOrSlug;
	if (typeof idOrSlug !== 'string') return { notFound: true };

	const [, currentUser] = await checkAuth(ctx);

	const [queryClient, getProps] = await prefetchData(ctx);

	const userByIdOrSlug = await getUserByIdOrSlug(queryClient, ctx, { idOrSlug });
	if (!userByIdOrSlug) return { notFound: true };

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
			isCurrentUser: userByIdOrSlug.id === currentUser?.id,
			...getProps()
		}
	};
});
