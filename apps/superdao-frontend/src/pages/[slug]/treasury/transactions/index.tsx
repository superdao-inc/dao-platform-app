import { Redirect } from 'next';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import isEmpty from 'lodash/isEmpty';
import { GetNextPageParamFunction } from 'react-query/types/core/types';
import isMobile from 'is-mobile';
import { Chain } from '@sd/superdao-shared';
import { getCurrentUserAsMember, getDaoWithRoles } from 'src/client/commonRequests';
import { prefetchData, SSR } from 'src/client/ssr';
import { Body, Loader, LoaderWrapper, PageContent, Title1, Title2 } from 'src/components';
import { CustomHead } from 'src/components/head';
import { useDaoMembersQuery } from 'src/gql/daoMembership.generated';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { DaoTransactionsQuery, useInfiniteDaoTransactionsQuery } from 'src/gql/treasury.generated';
import { useInfiniteScroll } from 'src/hooks';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { TreasuryNavigation } from 'src/pagesComponents/treasury/navigation';
import { getArtWrapperClass } from 'src/pagesComponents/treasury/styles';
import { TransactionsList } from 'src/pagesComponents/treasury/wallet/transactionsList';
import { featureToggles } from 'src/server/featureToggles.service';
import { colors } from 'src/style/variables';
import { MobileNavigation } from 'src/pagesComponents/treasury/mobileNavigation';
import { MobileTxsPage } from 'src/pagesComponents/treasury/mobileTxsPage';
import { MobileHeader } from 'src/components/mobileHeader';
import { useWalletsNameQuery } from 'src/gql/wallet.generated';

export const txsOffsetGenerator: GetNextPageParamFunction<DaoTransactionsQuery> = (lastpage, allPages) => {
	const nextOffset = lastpage.daoTransactions.offset + lastpage.daoTransactions.limit;
	const currentLength = allPages.flatMap((page) => page.daoTransactions.items).length;
	return nextOffset === currentLength && { offset: nextOffset };
};

type Props = {
	hostname: string;
	daoId: string;
	slug: string;
	isTransactionSeriveEnabled: boolean;
	isMobile: boolean;
};

const Transactions: NextPageWithLayout<Props> = (props) => {
	const { slug, daoId, isTransactionSeriveEnabled, isMobile } = props;

	const { t } = useTranslation();

	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug } = data || {};
	const { data: daoMemberData } = useDaoMembersQuery({ daoId, roles: null });
	const { data: walletsNameData } = useWalletsNameQuery({ daoId });

	const {
		data: txData,
		isLoading,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage
	} = useInfiniteDaoTransactionsQuery(
		{ daoId, offset: 0, chainId: null },
		{
			keepPreviousData: true,
			getNextPageParam: txsOffsetGenerator,
			cacheTime: 0
		}
	);

	const [renderSentry] = useInfiniteScroll({ isLoading, hasNextPage, fetchNextPage });

	if (!daoBySlug) return null;

	const txs = txData?.pages.flatMap((page) => page.daoTransactions.items);
	return (
		<PageContent>
			<CustomHead
				main={daoBySlug?.name ?? ''}
				additional={'Treasury transactions'}
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
			{!isLoading && isEmpty(txs) ? (
				<div className={getArtWrapperClass(isMobile)}>
					<Image src={'/assets/arts/emptyAssetsArt.svg'} priority={true} width={200} height={126} />

					<div>
						<Title2>{t('components.treasury.emptyState.transactions')}</Title2>
						<Body color={colors.foregroundTertiary}>{t('components.treasury.emptyState.transactionsHint')}</Body>
					</div>
				</div>
			) : isMobile ? (
				<>
					<MobileTxsPage
						transactions={txs || []}
						isCreator={true}
						daoMembers={daoMemberData?.daoMembers.items || []}
						chainId={Chain.Polygon}
						isPage={true}
						isLoading={isLoading}
					/>
					{renderSentry()}
				</>
			) : (
				<div className="bg-backgroundSecondary rounded-lg">
					<div className="py-5">
						<TransactionsList
							transactions={txs || []}
							isCreator={true}
							daoMembers={daoMemberData?.daoMembers.items || []}
							walletsName={walletsNameData?.walletsName || []}
							chainId={Chain.Polygon}
							isPage={true}
							isLoading={isLoading}
						/>
						{renderSentry()}
					</div>
				</div>
			)}
			{hasNextPage && <LoaderWrapper className="mt-5 h-6">{isFetchingNextPage && <Loader size="lg" />}</LoaderWrapper>}
		</PageContent>
	);
};

Transactions.getLayout = getDaoLayout;

export default Transactions;

export const getServerSideProps = SSR(async (ctx) => {
	const userID = ctx.req.session?.userId;
	const slug = ctx.params?.slug;
	if (!featureToggles.isEnabled('treasury_use_wallet_transactions_service')) return { notFound: true };
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
