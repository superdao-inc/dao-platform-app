import isMobile from 'is-mobile';
import { Redirect } from 'next';
import { useTranslation } from 'next-i18next';
import { getCurrentUserAsMember, getDaoWithRoles } from 'src/client/commonRequests';
import { prefetchData, SSR } from 'src/client/ssr';
import { PageContent, Title1 } from 'src/components';
import { CustomHead } from 'src/components/head';
import { MobileHeader } from 'src/components/mobileHeader';
import { useCurrentUserMemberRoleQuery } from 'src/gql/daoMembership.generated';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { useTreasuryQuery } from 'src/gql/treasury.generated';
import { useUserWalletAddressByIdOrSlugQuery } from 'src/gql/user.generated';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { WalletsDesktopPageContent } from 'src/pagesComponents/treasury/wallets/desktopPageContent';
import { WalletsMobilePageContent } from 'src/pagesComponents/treasury/wallets/mobilePageContent';
import { featureToggles } from 'src/server/featureToggles.service';
import { isAdmin } from 'src/utils/roles';

type Props = {
	hostname: string;
	daoId: string;
	slug: string;
	userId: string;
	isTransactionSeriveEnabled: boolean;
	isMobile: boolean;
};

const Wallets: NextPageWithLayout<Props> = (props) => {
	const { slug, daoId, isTransactionSeriveEnabled, userId, isMobile } = props;

	const { t } = useTranslation();

	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug } = data || {};

	const { data: memberRoleData } = useCurrentUserMemberRoleQuery({ daoId });
	const { data: userData } = useUserWalletAddressByIdOrSlugQuery({ idOrSlug: userId });
	const { walletAddress } = userData?.userByIdOrSlug || {};

	const hasAdminRights = isAdmin(memberRoleData?.currentUserMemberRole);
	const isMember = Boolean(memberRoleData?.currentUserMemberRole);

	const { data: treasuryData, isLoading } = useTreasuryQuery({
		daoId
	});
	const wallets = treasuryData?.treasury?.wallets || [];

	const WalletsPageContent = isMobile ? WalletsMobilePageContent : WalletsDesktopPageContent;

	if (!daoBySlug) return null;

	return (
		<PageContent>
			<CustomHead
				main={daoBySlug?.name ?? ''}
				additional={'Treasury wallets'}
				description={daoBySlug?.description ?? ''}
				avatar={daoBySlug?.avatar ?? null}
			/>
			<Title1 className="mb-6 hidden lg:flex">{t('pages.treasury.title')}</Title1>
			<MobileHeader withBurger title={t('pages.treasury.title')} />
			<WalletsPageContent
				isTransactionSeriveEnabled={isTransactionSeriveEnabled}
				walletAddress={walletAddress}
				hasAdminRights={hasAdminRights}
				isMember={isMember}
				isLoading={isLoading}
				wallets={wallets}
				slug={slug}
				daoId={daoId}
			/>
		</PageContent>
	);
};

Wallets.getLayout = getDaoLayout;

export default Wallets;

export const getServerSideProps = SSR(async (ctx) => {
	const slug = ctx.params?.slug;
	const userID = ctx.req.session?.userId;

	if (typeof slug !== 'string') return { notFound: true };

	const treasuryHomeRedirect: Redirect = {
		destination: `/${slug}/treasury`,
		permanent: false
	};

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	if (!isAuthorized) return { redirect: treasuryHomeRedirect };

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	const userAsMember = await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId: userID });
	if (!userAsMember) return { redirect: treasuryHomeRedirect };

	const isTransactionSeriveEnabled = featureToggles.isEnabled('treasury_use_wallet_transactions_service');
	const isMobileEnabled = featureToggles.isEnabled('treasury_mobile');

	return {
		props: {
			slug: dao.slug,
			daoId: dao.id,
			isTransactionSeriveEnabled,
			userId: userID,
			isMobile: isMobile({ ua: ctx.req }) && isMobileEnabled,
			...getProps()
		}
	};
});
