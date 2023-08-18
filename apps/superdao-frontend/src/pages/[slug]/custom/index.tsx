import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { useNftAdminCollectionQuery } from 'src/gql/nftAdmin.generated';
import { SaleType } from '@sd/superdao-shared';

import { PageContent, Title3, Title1 } from 'src/components';
import { useCheckChain } from 'src/hooks/useCheckChain';
import { useQueryTab } from 'src/hooks/useQueryTab';
import { AdminPanelSections } from 'src/pagesComponents/dao/nftEdit/types';
import { CollectionEditPanel } from 'src/pagesComponents/dao/nftEdit/collectionEditPanel';
import { SalePanel } from 'src/pagesComponents/dao/nftEdit/salePanel';
import { useDaoSales } from 'src/hooks';
import { NftEditSkeleton } from 'src/pagesComponents/dao/nftEdit/nftEditSkeleton';
import { useTreasuryMainWalletAddressQuery } from 'src/gql/treasury.generated';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { prefetchData, SSR, SSRAuthMiddleware } from 'src/client/ssr';
import { getCurrentUserAsMember, getDaoWithRoles } from 'src/client/commonRequests';
import { isAdmin } from 'src/utils/roles';
import { useNftCollectionQuery } from 'src/gql/nft.generated';
import { MobileHeader } from 'src/components/mobileHeader';

type Props = {
	slug: string;
	daoId: string;
	hostname: string;
	contractAddress: string;
};

const NftAdmin: NextPageWithLayout<Props> = (props) => {
	const { contractAddress, daoId } = props;

	const { back } = useRouter();
	const { t } = useTranslation();

	const [currentTab, setTab] = useQueryTab<AdminPanelSections>(AdminPanelSections.collection);
	const { isWrongChain } = useCheckChain();

	const {
		data: { nftAdminCollection } = {},
		isLoading,
		remove: removeAdminState
	} = useNftAdminCollectionQuery({ daoAddress: contractAddress }, { enabled: !isWrongChain });

	const { remove: removePublicState } = useNftCollectionQuery({ daoAddress: contractAddress }, { enabled: false });

	function reloadAdminAndPublicState() {
		removeAdminState();
		removePublicState();
	}

	const handleCreateTierButtonClick = () => setTab(AdminPanelSections.collection);

	const {
		isOpenSaleActive,
		isWhitelistSaleActive: isPrivateSaleActive,
		isLoading: isSaleStateLoading
	} = useDaoSales(daoId, false);

	const { data: treasuryMainWalletAddress, isLoading: isTreasuryWalletAddressLoading } =
		useTreasuryMainWalletAddressQuery({ daoId });

	const treasuryWalletAddress = treasuryMainWalletAddress?.treasuryMainWalletAddress;

	const title = useMemo(
		() => (
			<>
				<Title1 className="mb-4 hidden lg:block">{t(`pages.editNfts.title.${currentTab}`)}</Title1>
				<MobileHeader title={t(`pages.editNfts.title.${currentTab}`)} onBack={back} />
			</>
		),
		[currentTab, back, t]
	);

	if (isLoading || isSaleStateLoading || isSaleStateLoading || isWrongChain) {
		return (
			<PageContent columnSize="sm">
				{title}
				{(isLoading || isSaleStateLoading) && <NftEditSkeleton />}
				{isWrongChain && <Title3 className="mt-4">{t('toasts.wrongChain.title')}</Title3>}
			</PageContent>
		);
	}

	return (
		<PageContent columnSize="sm">
			{title}

			{currentTab === AdminPanelSections.collection && (
				<CollectionEditPanel
					collection={nftAdminCollection!}
					isLoading={isLoading}
					daoSlug={props.slug}
					contractAddress={contractAddress}
					reloadState={reloadAdminAndPublicState}
				/>
			)}

			{currentTab === AdminPanelSections.publicSale && (
				<SalePanel
					type={SaleType.Public}
					collection={nftAdminCollection!}
					isLoading={isLoading || isSaleStateLoading}
					onCreateTierButtonClick={handleCreateTierButtonClick}
					isSaleActive={isOpenSaleActive}
					treasuryWallet={treasuryWalletAddress}
					isTreasuryWalletLoading={isTreasuryWalletAddressLoading}
					daoAddress={contractAddress}
				/>
			)}

			{currentTab === AdminPanelSections.privateSale && (
				<SalePanel
					type={SaleType.Private}
					collection={nftAdminCollection!}
					isLoading={isLoading || isSaleStateLoading}
					onCreateTierButtonClick={handleCreateTierButtonClick}
					isSaleActive={isPrivateSaleActive}
					treasuryWallet={treasuryWalletAddress}
					isTreasuryWalletLoading={isTreasuryWalletAddressLoading}
					daoAddress={contractAddress}
				/>
			)}
		</PageContent>
	);
};

NftAdmin.getLayout = getDaoLayout;

export const getServerSideProps = SSR(SSRAuthMiddleware, async (ctx) => {
	const userID = ctx.req.session?.userId;
	const slug = ctx.params?.slug;
	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };

	const userAsMember = await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId: userID });
	if (!isAdmin(userAsMember?.role)) return { notFound: true };

	return {
		props: {
			slug: dao.slug,
			daoId: dao.id,
			contractAddress: dao.contractAddress,
			...getProps()
		}
	};
});

export default NftAdmin;
