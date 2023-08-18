import isMobile from 'is-mobile';
import { getDaoWithRoles, getUserByIdOrSlug } from 'src/client/commonRequests';
import { checkAuth, prefetchData, SSR } from 'src/client/ssr';
import { PageContent } from 'src/components';
import { CustomHead } from 'src/components/head';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { ProfileContent } from 'src/pagesComponents/achievements/myProfile/pageContent';
import { DaoMode } from 'src/types/types.generated';

type Props = {
	hostname: string;
	daoId: string;
	slug: string;
	userId: string;
	isMobile: boolean;
	slugId: string;
	daoAddress: string;
	currentUserAddress: string;
};

const Profile: NextPageWithLayout<Props> = (props) => {
	const { slug, userId, daoId, slugId, daoAddress, currentUserAddress, isMobile } = props;

	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug } = data || {};

	if (!daoBySlug) return null;

	return (
		<PageContent>
			<CustomHead
				main={daoBySlug?.name ?? ''}
				additional={'My Profile'}
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
				userAddress={currentUserAddress}
				isMobile={isMobile}
			/>
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
			slugId: currentUser!.slug || currentUser!.id,
			daoAddress: dao.contractAddress,
			currentUserAddress: currentUser?.walletAddress,
			daoId: dao.id,
			userId: userByIdOrSlug.id,
			isCurrentUser: userByIdOrSlug.id === currentUser?.id,
			isMobile: isMobile({ ua: ctx.req }),
			...getProps()
		}
	};
});
