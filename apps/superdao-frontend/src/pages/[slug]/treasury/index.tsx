import { useTranslation } from 'next-i18next';
import isMobile from 'is-mobile';
import { prefetchData, SSR } from 'src/client/ssr';
import { getDaoWithRoles, getCurrentUserAsMember, getUserByIdOrSlug } from 'src/client/commonRequests';
import { useTreasuryQuery, usePublicTreasuryQuery } from 'src/gql/treasury.generated';
import { PageContent, Title1 } from 'src/components';
import { AuthAPI } from 'src/features/auth/API';
import { UserAPI } from 'src/features/user/API';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { CustomHead } from 'src/components/head';
import { featureToggles } from 'src/server/featureToggles.service';
import { useUserAsMemberQuery } from 'src/gql/daoMembership.generated';
import { TreasuryBaseComponent } from 'src/pagesComponents/treasury/treasuryBase';
import { TreasuryNavigation } from 'src/pagesComponents/treasury/navigation';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { isAdmin } from 'src/utils/roles';
import { useChangeNftsVisibilityMutation } from 'src/gql/walletNfts.generated';
import { MobileHeader } from 'src/components/mobileHeader';
import { MobileNavigation } from 'src/pagesComponents/treasury/mobileNavigation';

type Props = {
	hostname: string;
	slug: string;
	daoId: string;
	contractAddress: string | null;
	isCreator: boolean;
	isTransactionSeriveEnabled: boolean;
	isMemberUser: boolean;
	isNftTransferEnabled: boolean;
	isWalletNftsServiceEnabled: boolean;
	isQuickActionsEnabled: boolean;
	isMobile: boolean;
};

const PublicTreasury: React.FC<Props & { daoName?: string }> = (props) => {
	const { daoId } = props;

	const {
		data: treasuryData,
		isLoading,
		isError
	} = usePublicTreasuryQuery({
		daoId
	});

	return <TreasuryBaseComponent {...props} {...{ treasuryData, isLoading, isError, isPublic: true }} />;
};

const PrivateTreasury: React.FC<Props & { daoName?: string }> = (props) => {
	const { daoId } = props;

	const {
		data: treasuryData,
		isLoading,
		isError,
		refetch
	} = useTreasuryQuery(
		{
			daoId
		},
		{ cacheTime: 0 }
	);
	const { data: memberRoleData } = UserAPI.useCurrentUserMemberRoleQuery({ daoId });

	const { currentUserMemberRole } = memberRoleData || {};
	const wallets = currentUserMemberRole && treasuryData?.treasury?.wallets;

	const { mutate } = useChangeNftsVisibilityMutation({});
	const changeNftVisibility = (id: string, isPublic: boolean) => {
		mutate({ nftsIds: [id], isPublic, daoId }, { onSuccess: () => refetch() });
	};

	return (
		<TreasuryBaseComponent
			{...props}
			{...{
				treasuryData,
				isLoading,
				isError,
				privateWallets: wallets,
				currentUserMemberRole,
				onChangeNftVisibility: changeNftVisibility,
				refetch,
				daoId
			}}
		/>
	);
};

const TreasuryPage: NextPageWithLayout<Props> = (props) => {
	const { slug, isTransactionSeriveEnabled, isMemberUser, isMobile } = props;

	const { t } = useTranslation();

	const isAuthorized = AuthAPI.useIsAuthorized();

	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug } = data || {};

	if (!daoBySlug) return null;

	return (
		<PageContent>
			<CustomHead
				main={daoBySlug?.name ?? ''}
				additional={'Treasury'}
				description={daoBySlug?.description ?? ''}
				avatar={daoBySlug?.avatar ?? null}
			/>

			<Title1 className="mb-6 hidden lg:flex" data-testid={'Treasury__title'}>
				{t('pages.treasury.title')}
			</Title1>
			<MobileHeader withBurger title={t('pages.treasury.title')} />

			{isAuthorized &&
				isMemberUser &&
				(isMobile ? (
					<MobileNavigation slug={slug} isTransactionSeriveEnabled={isTransactionSeriveEnabled} />
				) : (
					<TreasuryNavigation slug={slug} isTransactionSeriveEnabled={isTransactionSeriveEnabled} />
				))}
			{isAuthorized && isMemberUser ? (
				<PrivateTreasury {...props} daoName={daoBySlug?.name} />
			) : (
				<PublicTreasury {...props} daoName={daoBySlug?.name} />
			)}
		</PageContent>
	);
};

TreasuryPage.getLayout = getDaoLayout;

export const getServerSideProps = SSR(async (ctx) => {
	const slug = ctx.params?.slug;
	const userId = ctx.req.session?.userId;

	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	let userAsMember = null;
	let userByIdOrSlug = null;
	if (isAuthorized) {
		userAsMember = await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId });
		userByIdOrSlug = await getUserByIdOrSlug(queryClient, ctx, { idOrSlug: userId });
	} else {
		queryClient.setQueryData(useUserAsMemberQuery.getKey({ daoId: dao.id, userId }), null);
	}
	const isTransactionServiceEnabled = featureToggles.isEnabled('treasury_use_wallet_transactions_service');
	const isNftTransferEnabled = featureToggles.isEnabled('treasury_nft_transfer');
	const isWalletNftsServiceEnabled = featureToggles.isEnabled('treasury_use_nfts_service');
	const isQuickActionsEnabled = featureToggles.isEnabled('treasury_quick_actions_bar');
	const isMobileEnabled = featureToggles.isEnabled('treasury_mobile');

	return {
		props: {
			slug: dao.slug,
			daoId: dao.id,
			contractAddress: dao.contractAddress,
			isMemberUser: !!userAsMember,
			isCreator: isAuthorized ? isAdmin(userAsMember?.role) : false,
			isTransactionSeriveEnabled: isTransactionServiceEnabled,
			isNftTransferEnabled,
			isWalletNftsServiceEnabled,
			isQuickActionsEnabled,
			currentUserAddress: userByIdOrSlug?.walletAddress || null,
			isMobile: isMobile({ ua: ctx.req }) && isMobileEnabled,
			...getProps()
		}
	};
});
export default TreasuryPage;
