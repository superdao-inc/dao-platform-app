import isMobile from 'is-mobile';
import { Redirect } from 'next';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import isEmpty from 'lodash/isEmpty';
import { getCurrentUserAsMember, getDaoWithRoles } from 'src/client/commonRequests';
import { prefetchData, SSR } from 'src/client/ssr';
import { Body, PageContent, Title1 } from 'src/components';
import { CustomHead } from 'src/components/head';
import { MobileHeader } from 'src/components/mobileHeader';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { useTokensBalanceQuery } from 'src/gql/treasury.generated';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { AssetsList } from 'src/pagesComponents/treasury/assetsList';
import { AssetsPageMobile } from 'src/pagesComponents/treasury/assetsPageMobile';
import { MobileNavigation } from 'src/pagesComponents/treasury/mobileNavigation';
import { TreasuryNavigation } from 'src/pagesComponents/treasury/navigation';
import { getArtWrapperClass } from 'src/pagesComponents/treasury/styles';
import { featureToggles } from 'src/server/featureToggles.service';
import { colors } from 'src/style';

type Props = {
	hostname: string;
	daoId: string;
	slug: string;
	isTransactionSeriveEnabled: boolean;
	isMobile: boolean;
};

const Assets: NextPageWithLayout<Props> = (props) => {
	const { slug, daoId, isTransactionSeriveEnabled, isMobile } = props;

	const { t } = useTranslation();

	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug } = data || {};

	const { data: tokensData, isLoading } = useTokensBalanceQuery(
		{
			daoId
		},
		{ cacheTime: 0 }
	);

	if (!daoBySlug) return null;

	const tokens = tokensData?.tokensBalance || [];

	return (
		<PageContent>
			<CustomHead
				main={daoBySlug?.name ?? ''}
				additional={'Treasury assets'}
				description={daoBySlug?.description ?? ''}
				avatar={daoBySlug?.avatar ?? null}
			/>

			<Title1 className="mb-6 hidden lg:flex">{t('pages.treasury.title')}</Title1>
			<MobileHeader withBurger title={t('pages.treasury.title')} />

			{isMobile ? (
				<MobileNavigation slug={slug} isTransactionSeriveEnabled={isTransactionSeriveEnabled} />
			) : (
				<TreasuryNavigation slug={slug} isTransactionSeriveEnabled={isTransactionSeriveEnabled} />
			)}

			{isEmpty(tokens) && !isLoading ? (
				<div className={getArtWrapperClass(isMobile)}>
					<Image src={'/assets/arts/emptyAssetsArt.svg'} priority={true} width={200} height={126} />

					<div>
						<Title1>{t('components.treasury.emptyState.assets')}</Title1>
						<Body color={colors.foregroundTertiary}>{t('components.treasury.emptyState.assetsHint')}</Body>
					</div>
				</div>
			) : isMobile ? (
				<AssetsPageMobile list={tokens} isLoading={isLoading} />
			) : (
				<AssetsList list={tokens} isLoading={isLoading} isPage={true} />
			)}
		</PageContent>
	);
};

Assets.getLayout = getDaoLayout;

export default Assets;

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
			isMobile: isMobile({ ua: ctx.req }) && isMobileEnabled,
			...getProps()
		}
	};
});
