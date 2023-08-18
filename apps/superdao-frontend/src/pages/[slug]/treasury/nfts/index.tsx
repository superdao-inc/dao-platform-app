import { Redirect } from 'next';
import isEmpty from 'lodash/isEmpty';
import isMobile from 'is-mobile';
import { GetNextPageParamFunction } from 'react-query/types/core/types';

import { prefetchData, SSR } from 'src/client/ssr';
import { getDaoWithRoles, getCurrentUserAsMember, getUserByIdOrSlug } from 'src/client/commonRequests';
import { PageContent } from 'src/components';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { CustomHead } from 'src/components/head';
import {
	PublicTreasuryNftsQuery,
	usePublicTreasuryNftsQuery,
	useInfinitePrivateTreasuryNftsQuery,
	useTreasuryQuery
} from 'src/gql/treasury.generated';
import { useInfiniteScroll } from 'src/hooks';
import { getAddress } from '@sd/superdao-shared';
import { featureToggles } from 'src/server/featureToggles.service';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { AuthAPI } from 'src/features/auth/API';
import { useChangeNftsVisibilityMutation } from 'src/gql/walletNfts.generated';
import { UserAPI } from 'src/features/user';
import { isAdmin } from 'src/utils/roles';
import MobileNfts from 'src/pagesComponents/treasury/nfts/mobileNftsPage';
import DesktopNfts from 'src/pagesComponents/treasury/nfts/desktopNftsPage';

export const nftsOffsetGenerator: GetNextPageParamFunction<PublicTreasuryNftsQuery> = (lastPage, allPages) => {
	if (!lastPage.treasury?.nfts.length) {
		return undefined;
	}
	const totalNfts = allPages.reduce((offset, nextPage) => offset + (nextPage.treasury?.nfts?.length || 0), 0);

	return {
		offset: totalNfts
	};
};

type Props = {
	hostname: string;
	daoId: string;
	slug: string;
	isTransactionSeriveEnabled: boolean;
	currentUserAddress?: string;
	isNftTransferEnabled: boolean;
	isWalletNftsServiceEnabled: boolean;
	isQuickActionsEnabled: boolean;
	isMobile: boolean;
};

const NFTs: NextPageWithLayout<Props> = (props) => {
	const {
		slug,
		daoId,
		isTransactionSeriveEnabled,
		currentUserAddress,
		isNftTransferEnabled,
		isWalletNftsServiceEnabled,
		isQuickActionsEnabled,
		isMobile
	} = props;

	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { data: memberRoleData } = UserAPI.useCurrentUserMemberRoleQuery({ daoId });
	const { daoBySlug } = data || {};
	const isCreator = isAdmin(memberRoleData?.currentUserMemberRole);

	const {
		data: publicNftsData,
		isLoading: isPublicNftsLoading,
		refetch: refetchPublicNfts
	} = usePublicTreasuryNftsQuery(
		{ daoId },
		{
			keepPreviousData: true,
			select: (data) => data.treasury?.nfts,
			cacheTime: 0
		}
	);

	const {
		data: privateNftsData,
		isLoading: isPrivateNftsLoading,
		hasNextPage,
		fetchNextPage,
		refetch: refetchPrivateNfts
	} = useInfinitePrivateTreasuryNftsQuery(
		{
			daoId,
			offset: 0
		},
		{
			keepPreviousData: true,
			getNextPageParam: nftsOffsetGenerator,
			cacheTime: 0
		}
	);
	const isAuthorized = AuthAPI.useIsAuthorized();

	const { data: treasuryWalletsData, isLoading: isWalletsLoading } = useTreasuryQuery(
		{
			daoId
		},
		{ enabled: isAuthorized && isCreator }
	);
	const wallets = treasuryWalletsData?.treasury?.wallets || [];

	const { mutate } = useChangeNftsVisibilityMutation({});
	const changeNftVisibility = (id: string, isPublic: boolean) => {
		mutate(
			{ nftsIds: [id], isPublic, daoId },
			{
				onSuccess: () => Promise.all([refetchPublicNfts(), refetchPrivateNfts()])
			}
		);
	};

	const [renderSentry] = useInfiniteScroll({ isLoading: isPrivateNftsLoading, hasNextPage, fetchNextPage });

	if (!daoBySlug) return null;

	const publicNfts =
		publicNftsData?.map((nft) => {
			if (!isEmpty(wallets)) {
				const wallet = wallets.find(({ address }) => getAddress(address) === getAddress(nft.ownerOf));

				return wallet ? { ...nft, walletName: wallet.name, chainId: wallet.chainId, walletType: wallet.type } : nft;
			}
			return nft;
		}) || [];

	const privateNfts = privateNftsData?.pages.flatMap((page) => {
		if (!isEmpty(wallets)) {
			return (
				page.treasury?.nfts.map((nft) => {
					const wallet = wallets.find(({ address }) => getAddress(address) === getAddress(nft.ownerOf));

					return wallet ? { ...nft, walletName: wallet.name, chainId: wallet.chainId, walletType: wallet.type } : nft;
				}) || []
			);
		}
		return page.treasury?.nfts || [];
	});

	const isLoading = isPublicNftsLoading || isPrivateNftsLoading || isWalletsLoading;

	return (
		<PageContent className="h-full">
			<CustomHead
				main={daoBySlug?.name ?? ''}
				additional={'Treasury nfts'}
				description={daoBySlug?.description ?? ''}
				avatar={daoBySlug?.avatar ?? null}
			/>
			{isMobile ? (
				<MobileNfts
					slug={slug}
					isTransactionSeriveEnabled={isTransactionSeriveEnabled}
					currentUserAddress={currentUserAddress}
					isNftTransferEnabled={isNftTransferEnabled}
					isQuickActionsEnabled={isQuickActionsEnabled}
					publicNfts={publicNfts}
					privateNfts={privateNfts}
					isLoading={isLoading}
					isPrivateNftsLoading={isPrivateNftsLoading}
					isPublicNftsLoading={isPublicNftsLoading}
					changeNftVisibility={changeNftVisibility}
					refetchPrivateNfts={refetchPrivateNfts}
					refetchPublicNfts={refetchPublicNfts}
					showChangeVisibilityOption={isAdmin(memberRoleData?.currentUserMemberRole) && isWalletNftsServiceEnabled}
					isCreator={isCreator}
					renderSentry={renderSentry}
					isMobile={isMobile}
				/>
			) : (
				<DesktopNfts
					slug={slug}
					isTransactionSeriveEnabled={isTransactionSeriveEnabled}
					currentUserAddress={currentUserAddress}
					isNftTransferEnabled={isNftTransferEnabled}
					isQuickActionsEnabled={isQuickActionsEnabled}
					publicNfts={publicNfts}
					privateNfts={privateNfts}
					isPrivateNftsLoading={isPrivateNftsLoading}
					isPublicNftsLoading={isPublicNftsLoading}
					changeNftVisibility={changeNftVisibility}
					refetchPrivateNfts={refetchPrivateNfts}
					refetchPublicNfts={refetchPublicNfts}
					showChangeVisibilityOption={isAdmin(memberRoleData?.currentUserMemberRole) && isWalletNftsServiceEnabled}
					isCreator={isCreator}
					renderSentry={renderSentry}
				/>
			)}
		</PageContent>
	);
};

NFTs.getLayout = getDaoLayout;

export default NFTs;

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
	const userByIdOrSlug = await getUserByIdOrSlug(queryClient, ctx, { idOrSlug: userID });

	const isTransactionSeriveEnabled = featureToggles.isEnabled('treasury_use_wallet_transactions_service');
	const isNftTransferEnabled = featureToggles.isEnabled('treasury_nft_transfer');
	const isWalletNftsServiceEnabled = featureToggles.isEnabled('treasury_use_nfts_service');
	const isQuickActionsEnabled = featureToggles.isEnabled('treasury_quick_actions_bar');
	const isMobileEnabled = featureToggles.isEnabled('treasury_mobile');

	return {
		props: {
			slug: dao.slug,
			daoId: dao.id,
			isTransactionSeriveEnabled,
			currentUserAddress: userByIdOrSlug?.walletAddress,
			isNftTransferEnabled,
			isWalletNftsServiceEnabled,
			isQuickActionsEnabled,
			isMobile: isMobile({ ua: ctx.req }) && isMobileEnabled,
			...getProps()
		}
	};
});
