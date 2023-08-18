import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import uniqBy from 'lodash/uniqBy';

import { PageContent, PageLoader } from 'src/components';
import { SSR, prefetchData } from 'src/client/ssr';
import { Name } from 'src/pagesComponents/common/header';
import { getCurrentUserAsMember, getDaoWithRoles } from 'src/client/commonRequests';
import {
	CollectionInfoByTierQuery,
	useClaimNftByEmailMutation,
	useCollectionArtworksQuery,
	useCollectionInfoByTierQuery
} from 'src/gql/nft.generated';
import { useBuyWhitelistNft, useDaoSales } from 'src/hooks';
import { TierArtworkTypeStrings } from 'src/types/types.generated';
import { UserAPI } from 'src/features/user/API';
import { PublicDaoFragment } from 'src/gql/daos.generated';
import { CustomHead } from 'src/components/head';
import { getOpenseaTiersUrl, openExternal } from 'src/utils/urls';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { config } from 'src/constants/environment';
import { isAdmin } from 'src/utils/roles';
import { MobileHeader } from 'src/components/mobileHeader';
// import { useRedirectToCheckout } from 'src/features/checkout/internal/hooks/useRedirectToCheckout';
import { useStatusSaleTierByConditional } from 'src/hooks/useStatusSaleTierByConditional';
import { TabsRefProps, TierInfo } from 'src/pagesComponents/nft/tierInfo';
import { ChainLabel } from 'src/pagesComponents/nft/helpers';
import { DetailsHead, DetailsLayout } from 'src/pagesComponents/nft/details';
import { DetailsAction } from 'src/pagesComponents/nft/details/detailsAction';
import { DeactivatedNft } from 'src/pagesComponents/nft/details/deactivatedNft';
import { getProtocol } from 'src/utils/protocol';
import { SharingAddon } from 'src/features/dao/tier/sharing/sharingAddon';
import { ClaimType } from 'src/constants/claimType';
import { useGetWhitelistRecordQuery } from 'src/gql/whitelist.generated';
import { WhitelistStatusEnum } from 'src/types/types.generated';
import { ClaimStatus } from 'src/features/claim/nft/components/claimStatus';
import { socketConnection } from 'src/components/socketProvider';
import { UnknownErrorModal } from 'src/features/claim/nft/components/unknownErrorModal';
import { TierSaleStatus } from 'src/constants/tierSaleStatus';
import { AuthUI } from 'src/features/auth';
import { durationDelays } from 'src/constants/delay';
import { ClaimNftSuccessMessageBody, isString, MessageName } from '@sd/superdao-shared';

const CHAIN_ID = config.polygon.chainId;

type Props = {
	dao: PublicDaoFragment;
	tier: string;
	tierData: CollectionInfoByTierQuery['collectionInfoByTier'];
	protocol: string;
	hostname: string;
	isAdminRights: boolean;
	isAuthorized: boolean;
};

const NftDetailsPage: NextPageWithLayout<Props> = (props) => {
	const { dao, tier, tierData, hostname, protocol, isAdminRights, isAuthorized } = props;

	//hooks
	const { t } = useTranslation();
	const { push, asPath, query } = useRouter();
	const [isClaiming, setClaiming] = useState(false);
	const [isShowClaimErrorModal, setShowClaimErrorModal] = useState(false);
	const tabsRef = useRef<TabsRefProps | null>(null);

	// path queries
	const claimQuery = typeof query.claim === 'string' ? query.claim : '';
	const claimId = typeof query.claimId === 'string' ? query.claimId : '';
	const autoClaim = typeof query.autoClaim === 'string' ? query.autoClaim : '';

	//variables
	const isEmailClaimMode = Boolean(claimQuery === ClaimType.EMAIL && claimId);
	const fullUrl = protocol + hostname + asPath;
	const hasMintedNft = tierData?.maxAmount! > 0 && tierData?.totalAmount !== 0;
	const tierOpenseaUrl = useMemo(
		() =>
			tierData?.collectionName && (tierData?.tierName || tierData?.id)
				? getOpenseaTiersUrl(tierData?.tierName || tierData?.id, tierData.collectionAddress, dao.openseaUrl || '')
				: undefined,
		[tierData, dao]
	);
	const creatorProps = useMemo(
		() => ({
			name: dao.name,
			slug: dao.slug,
			avatar: dao.avatar,
			id: dao.id
		}),
		[dao]
	);

	//helpers hooks
	const { openAuthModal, closeAuthModal } = AuthUI.useAuthModal();
	const { isLoading: isSalesLoading, isWhitelistSaleActive, isOpenSaleActive } = useDaoSales(dao.id, false);
	const { data: userData } = UserAPI.useCurrentUserQuery();
	const {
		isLoading: isStatusSaleLoading,
		status,
		fiatPrice,
		tokenPrice
	} = useStatusSaleTierByConditional({
		isCollectionOpenSaleActive: isOpenSaleActive,
		isCollectionPrivateSaleActive: isWhitelistSaleActive,
		daoId: dao.id,
		daoAddress: dao.contractAddress!,
		tier,
		totalPrice: tierData.totalPrice,
		amount: {
			max: tierData.maxAmount,
			total: tierData.totalAmount
		},
		isClaim: isEmailClaimMode,
		currency: tierData.currency
	});

	//mutations
	const { mutate: buyWhitelistNft, isLoading: isBuyingLoading } = useBuyWhitelistNft({
		currentUser: userData?.currentUser
	});
	const { mutate: claimNftByEmail } = useClaimNftByEmailMutation();

	//query
	const { data: whitelistRecord, isLoading: whitelistRecordLoading } = useGetWhitelistRecordQuery(
		{ id: claimId },
		{ enabled: isEmailClaimMode }
	);
	const { status: emailClaimRecordStatus } = whitelistRecord?.getWhitelistRecord || {};

	const { data: artworks, isLoading: isLoadingArtworks } = useCollectionArtworksQuery(
		{ daoAddress: dao.contractAddress!, tier },
		{ enabled: tierData?.tierArtworkType !== TierArtworkTypeStrings.One }
	);
	const artworksData = artworks?.collectionArtworks?.artworks;

	//functions
	const goToDaoHomePage = () => push(`/${dao.slug}`);
	// const redirectToCheckout = useRedirectToCheckout(dao.slug, tier);

	const handleClaimError = (error: string | unknown) => {
		setClaiming(false);
		setShowClaimErrorModal(true);

		const message = typeof error === 'string' ? JSON.parse(error)?.[0]?.message : undefined;
	};

	const redirectToAutoClaim = () => {
		closeAuthModal();

		push(`${asPath}&autoClaim=1`);
	};

	const onClaim = () => {
		if (!isAuthorized) {
			return openAuthModal({
				onClose: closeAuthModal,
				onSuccess: redirectToAutoClaim
			});
		}

		setClaiming(true);
		claimNftByEmail({ uid: claimId }, { onError: handleClaimError });
	};

	const handleMoreArtworks = useCallback(() => {
		const artworksTab = tabsRef?.current?.tabs?.[1];
		tabsRef?.current?.setActiveTab(artworksTab);

		setTimeout(() => {
			window.scrollTo({ top: tabsRef?.current?.node?.getBoundingClientRect()?.top, behavior: 'smooth' });
		}, durationDelays.fast);
	}, [tabsRef]);

	//for auto claim
	useEffect(() => {
		if (autoClaim === '1' && emailClaimRecordStatus === WhitelistStatusEnum.Enabled) {
			onClaim?.();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autoClaim]);
	//for redirect after success claim
	useEffect(() => {
		socketConnection?.on(MessageName.CLAIM_NFT_FAIL, () => setShowClaimErrorModal(true));
		socketConnection?.on(MessageName.CLAIM_NFT_FAIL_HAS_NFT, () => setShowClaimErrorModal(true));
		socketConnection?.on(MessageName.CLAIM_NFT_SUCCESS, (data: ClaimNftSuccessMessageBody) =>
			push(`/${dao.slug}/claim/success?tier=${tier}&daoSlug=${data.daoSlug}&byEmail=${claimId}`)
		);

		return () => {
			socketConnection?.off(MessageName.CLAIM_NFT_FAIL);
			socketConnection?.off(MessageName.CLAIM_NFT_FAIL_HAS_NFT);
			socketConnection?.off(MessageName.CLAIM_NFT_SUCCESS);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	//Data for tier info tabs
	const tabsData: React.ComponentProps<typeof TierInfo> = useMemo(() => {
		return {
			overviewData: {
				description: tierData.description || ''
			},

			artworksData: {
				isLoading: isLoadingArtworks,
				isError: !artworksData,
				artworks: artworksData || []
			},
			detailsData: {
				contractAddress: tierData.collectionAddress,
				openseaLink: hasMintedNft ? tierOpenseaUrl : undefined,
				chain: 'polygon' as ChainLabel
			},
			ownersData: {
				collectionAddress: tierData.collectionAddress,
				owners: uniqBy(tierData.owners, 'id'),
				slug: dao.slug,
				tier: tier,
				isLimited: true
			}
		};
	}, [artworksData, dao, hasMintedNft, isLoadingArtworks, tier, tierData, tierOpenseaUrl]);

	if (!tierData) {
		goToDaoHomePage();
		return null;
	}

	if ((emailClaimRecordStatus && emailClaimRecordStatus !== WhitelistStatusEnum.Enabled) || isClaiming) {
		return (
			<ClaimStatus
				type={ClaimType.EMAIL}
				isClaiming={isClaiming}
				status={emailClaimRecordStatus!}
				daoName={dao.name}
				daoSlug={dao.slug}
			/>
		);
	}
	if (!userData || (isEmailClaimMode && whitelistRecordLoading)) {
		return (
			<PageContent>
				<CustomHead
					main={dao?.name ? dao?.name : 'NFT details'}
					additional={dao?.name ? 'NFT details' : 'Superdao'}
					description={dao?.description ?? ''}
					avatar={dao?.avatar ?? null}
				/>

				<PageLoader />
			</PageContent>
		);
	}

	const btnAction = () => {
		if (status === TierSaleStatus.CLAIM) {
			onClaim();
			return;
		}

		if (status === TierSaleStatus.NOT_AVAILABLE) {
			tierOpenseaUrl && openExternal(tierOpenseaUrl);
			return;
		}

		if (status === TierSaleStatus.AUTHORIZATION || status === TierSaleStatus.NOT_IN_WHITELIST) {
			openAuthModal({
				onClose: closeAuthModal,
				onSuccess: closeAuthModal
			});
			return;
		}

		if (status === TierSaleStatus.PRIVATE_SALE) {
			buyWhitelistNft({
				daoAddress: dao.contractAddress!,
				toAddress: userData.currentUser.walletAddress,
				tier
			});
			return;
		}

		if (status === TierSaleStatus.OPEN_SALE) {
			// redirectToCheckout().then();
			push(`/${dao.slug}/${tier}/checkout/payment-selection`);
			return;
		}
	};

	return (
		<PageContent onBack={goToDaoHomePage}>
			<SharingAddon
				fullUrl={fullUrl}
				daoName={dao.name}
				tier={tierData?.tierName || ''}
				tierId={tier}
				hostname={hostname}
				protocol={protocol}
				slug={dao.slug}
			/>

			<CustomHead
				main={dao?.name ? dao?.name : 'NFT details'}
				additional={dao?.name ? 'NFT details' : 'Superdao'}
				description={dao?.description ?? ''}
				avatar={dao?.avatar ?? null}
			/>

			<Name className="mb-6 hidden lg:!flex" data-testid="NftCard__tierHeader">
				{t('pages.nft.title', { name: tierData.tierName })}
			</Name>

			<MobileHeader
				className="mb-1"
				title={t('pages.nft.title', { name: tierData.tierName })}
				onBack={goToDaoHomePage}
			/>

			<DetailsLayout
				artworks={artworksData ? artworksData : tierData.artworks}
				artworksTotalLength={artworksData?.length || tierData?.artworks?.length || 0}
				onMoreArtworks={handleMoreArtworks}
			>
				<DetailsHead
					collectionName={tierData?.collectionName}
					tierName={tierData?.tierName}
					tierArtworkType={tierData?.tierArtworkType}
					amount={{ maxAmount: tierData.maxAmount, totalAmount: tierData.totalAmount }}
					creator={creatorProps}
					daoName={dao.name}
					fullUrl={fullUrl}
					isSharingEnabled={!!fullUrl}
				/>
				{tierData.isDeactivated ? (
					<DeactivatedNft
						daoAddress={dao.contractAddress!}
						leftAmount={tierData.totalAmount}
						tierId={tierData.id}
						collectionAddress={tierData.collectionAddress}
						goToDaoHomePage={goToDaoHomePage}
						isAdminRights={isAdminRights}
					/>
				) : (
					<DetailsAction
						isAuthorized={isAuthorized}
						chainId={CHAIN_ID}
						btnAction={btnAction}
						isButtonLoading={isBuyingLoading}
						isLoading={isSalesLoading || isStatusSaleLoading}
						fiatPrice={fiatPrice}
						tokenPrice={tokenPrice}
						status={status}
					/>
				)}
			</DetailsLayout>

			<TierInfo
				{...tabsData}
				ref={tabsRef}
				isShowArtworks={tierData.tierArtworkType === TierArtworkTypeStrings.Random && !tierData.isDeactivated}
			/>

			<UnknownErrorModal isOpen={isShowClaimErrorModal} onClose={() => setShowClaimErrorModal(false)} />
		</PageContent>
	);
};

NftDetailsPage.getLayout = getDaoLayout;

export default NftDetailsPage;

export const getServerSideProps = SSR(async (ctx) => {
	const userId = ctx.req.session?.userId;

	const { tier } = ctx.query;
	const slug = ctx.params?.slug;

	if (!isString(slug) || !isString(tier)) return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao?.contractAddress) return { notFound: true };

	const tierQuery = await queryClient.fetchQuery<CollectionInfoByTierQuery | undefined>(
		useCollectionInfoByTierQuery.getKey({ daoAddress: dao.contractAddress, tier }),
		useCollectionInfoByTierQuery.fetcher({ daoAddress: dao.contractAddress, tier })
	);
	const tierData = tierQuery?.collectionInfoByTier;
	if (!tierData) return { notFound: true };

	const protocol = getProtocol(ctx);

	let userAsMember;
	if (userId) {
		userAsMember = await getCurrentUserAsMember(queryClient, ctx, { daoId: dao.id, userId: userId });
	}
	if (tierData.isDeactivated) {
		const userIsCreator = isAdmin(userAsMember?.role);
		if (!userIsCreator) return { notFound: true };
	}

	return {
		props: {
			dao,
			tier,
			protocol,
			tierData,
			isAuthorized,
			isAdminRights: isAdmin(userAsMember?.role),
			...getProps()
		}
	};
});
