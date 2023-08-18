import isMobile from 'is-mobile';
import { useRouter } from 'next/router';
import { shrinkWallet } from '@sd/superdao-shared';
import { getDaoWithRoles, getUserByIdOrSlug } from 'src/client/commonRequests';
import { checkAuth, prefetchData, SSR } from 'src/client/ssr';
import { PageContent } from 'src/components';
import { CustomHead } from 'src/components/head';
import { MobileHeader } from 'src/components/mobileHeader';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { UserByIdOrSlugQuery } from 'src/gql/user.generated';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { ProfileContent } from 'src/pagesComponents/achievements/myProfile/pageContent';
import { DaoMode } from 'src/types/types.generated';

type Props = {
	hostname: string;
	daoId: string;
	slug: string;
	isMobile: boolean;
	daoAddress: string;
	currentUserAddress: string;
	user: UserByIdOrSlugQuery['userByIdOrSlug'];
};

const Profile: NextPageWithLayout<Props> = (props) => {
	const { slug, daoId, daoAddress, isMobile, currentUserAddress, user } = props;
	const { walletAddress: userAddress, slug: userSlug, id: userId, displayName, ens } = user || {};
	const slugId = userSlug || userId;
	const name = displayName || shrinkWallet(ens || userAddress);
	const { push, query } = useRouter();
	const { slug: daoSlug } = query;
	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug } = data || {};

	if (!daoBySlug) return null;

	const handleBack = () => push(`/${daoSlug}/achievements/leaderboard`);

	return (
		<PageContent onBack={handleBack}>
			<CustomHead
				main={daoBySlug?.name ?? ''}
				additional={name}
				description={daoBySlug?.description ?? ''}
				avatar={daoBySlug?.avatar ?? null}
			/>
			<ProfileContent
				userId={userId}
				slugId={slugId}
				daoId={daoId}
				daoAddress={daoAddress}
				slug={slug}
				currentUserAddress={currentUserAddress}
				userAddress={userAddress}
				isMobile={isMobile}
				isLeaderBoardTab
			/>
			<MobileHeader withBurger />
		</PageContent>
	);
};

Profile.getLayout = getDaoLayout;

export default Profile;

export const getServerSideProps = SSR(async (ctx) => {
	const slug = ctx.params?.slug;
	if (typeof slug !== 'string') return { notFound: true };

	const idOrSlug = ctx.params?.idOrSlug;
	if (typeof idOrSlug !== 'string') return { notFound: true };

	const [authRedirect, currentUser] = await checkAuth(ctx);
	if (authRedirect) return authRedirect;

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };
	if (dao.mode !== DaoMode.Achievements) return { notFound: true };

	const userByIdOrSlug = await getUserByIdOrSlug(queryClient, ctx, { idOrSlug });
	if (!userByIdOrSlug) return { notFound: true };

	return {
		props: {
			slug: slug,
			slugId: userByIdOrSlug!.slug || userByIdOrSlug!.id,
			daoAddress: dao.contractAddress,
			userAddress: userByIdOrSlug?.walletAddress || null,
			currentUserAddress: currentUser?.walletAddress,
			daoId: dao.id,
			userId: userByIdOrSlug.id,
			isMobile: isMobile({ ua: ctx.req }),
			user: userByIdOrSlug,
			...getProps()
		}
	};
});
