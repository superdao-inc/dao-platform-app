import isMobile from 'is-mobile';
import isString from 'lodash/isString';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import concat from 'lodash/concat';
import isEmpty from 'lodash/isEmpty';
import cn from 'classnames';
import uniqBy from 'lodash/uniqBy';
import { FEATURES, getAddress, shrinkWallet } from '@sd/superdao-shared';
import { checkAuth, prefetchData, SSR } from 'src/client/ssr';

import { getDaoWithRoles, getUserByIdOrSlug } from 'src/client/commonRequests';
import { PageContent, PageLoader, Title1, Title2, Title3 } from 'src/components';
import { CustomHead } from 'src/components/head';
import { MobileHeader } from 'src/components/mobileHeader';
import { useGetAchievementTierQuery, useGetAchievementTiersQuery } from 'src/gql/achievements.generated';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { PublicUserFragment } from 'src/gql/user.generated';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { getIsFeatureEnabled } from 'src/server/featureToggles.service';
import { getOpenseaTiersUrl } from 'src/utils/urls';
import { DetailsHead } from 'src/pagesComponents/achievements/achievementDetails/detailsHead';
import { DetailsLayout } from 'src/pagesComponents/achievements/achievementDetails/detailsLayout';
import { getProtocol } from 'src/utils/protocol';
import { NftDescription } from 'src/pagesComponents/nft/nftDescription';
import { Badge } from 'src/pagesComponents/achievements/shared/labelBadge';
import { Owners } from 'src/pagesComponents/achievements/achievementDetails/owners';
import { MetadataAttributesSdTraits } from 'src/pagesComponents/dao/nftEdit/types';
import { colors } from 'src/style';
import { AchievementsNfts } from 'src/pagesComponents/achievements/achievementsPage/page';
import { DaoMode } from 'src/types/types.generated';
import { useNftCollectionQuery } from 'src/gql/nft.generated';

type Props = {
	hostname: string;
	protocol: string;
	daoId: string;
	slug: string;
	userId: string;
	isMobile: boolean;
	tierId: string;
	daoAddress: string;
	daoName: string;
	daoSlug: string;
	daoAvatar: string;
	collectionOpenseaUrl?: string;
	isCurrentUser: boolean;
	isSharingEnabled: boolean;
	currentUser: PublicUserFragment;
};

const AchievementDetails: NextPageWithLayout<Props> = (props) => {
	const { slug, tierId, daoAddress, collectionOpenseaUrl, currentUser, isCurrentUser, isMobile } = props;

	const { t } = useTranslation();

	const { push } = useRouter();

	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug } = data || {};

	const { data: achievementTier, isLoading } = useGetAchievementTierQuery(
		{ daoAddress, tier: tierId },
		{
			keepPreviousData: true,
			select: (data) => data.getAchievementTier,
			cacheTime: 0
		}
	);

	const { data: NftCollection } = useNftCollectionQuery({ daoAddress: daoAddress });
	const { collection } = NftCollection || {};

	let { data: achievementsNfts } = useGetAchievementTiersQuery(
		{ daoAddress },
		{
			keepPreviousData: true,
			select: (data) => data.getAchievementTiers.filter((item) => !item.isDeactivated),
			cacheTime: 0
		}
	);

	achievementsNfts = achievementsNfts?.filter((item) => {
		return collection?.tiers.find((tier) => tier.id === item.id);
	});

	const tierOpenseaUrl = useMemo(
		() =>
			achievementTier?.collectionName && (achievementTier?.tierName || achievementTier?.id)
				? getOpenseaTiersUrl(
						achievementTier?.tierName || achievementTier?.id,
						achievementTier.collectionAddress,
						collectionOpenseaUrl
				  )
				: null,
		[achievementTier, collectionOpenseaUrl]
	);

	const ownerProps = useMemo(
		() =>
			!isEmpty(currentUser)
				? {
						name: currentUser.displayName || currentUser.ens || shrinkWallet(currentUser.walletAddress),
						slug,
						avatar: currentUser.avatar,
						id: currentUser.id
				  }
				: undefined,
		[slug, currentUser]
	);

	const handleBack = () => push(`/${slug}/achievements/all`);

	if (!daoBySlug) return null;

	const collectionNfts = achievementsNfts?.filter(
		(nft) => getAddress(achievementTier?.collectionAddress) === getAddress(nft.collectionAddress)
	);

	const xp =
		achievementTier?.metadata?.attributes
			?.filter((attr) => attr.sdTrait === MetadataAttributesSdTraits.ACHIEVEMENT_XP_SD_TRAIT)
			.map((attr) => attr.value)[0] || null;

	const xpBadge = xp ? [{ title: `${xp} xp`, isColored: true }] : [];

	const labels =
		achievementTier?.metadata?.attributes
			?.filter((attr) => attr.sdTrait === MetadataAttributesSdTraits.ACHIEVEMENT_LABEL_SD_TRAIT)
			.map((attr) => attr.value || '') || [];

	const badges: {
		title: string;
		isColored?: boolean;
	}[] = isEmpty(labels) ? xpBadge : concat(xpBadge, labels?.map((label) => ({ title: label })) || []);

	const wrapperClass = 'bg-backgroundSecondary mt-5 w-full rounded-lg pb-6';
	const ownersHashMap = uniqBy(achievementTier?.owners, 'id');
	const ownersWallets = achievementTier?.owners.map((owner) => getAddress(owner.walletAddress));
	const isOwnedByCurrentUser = ownersWallets?.includes(getAddress(currentUser?.walletAddress));
	const getNfts = isCurrentUser ? collectionNfts || [] : achievementsNfts || [];

	if (isLoading) {
		return (
			<PageContent>
				<CustomHead
					main={daoBySlug?.name ?? ''}
					additional={t('pages.achievements.all.achievementDetails.title')}
					description={daoBySlug?.description ?? ''}
					avatar={daoBySlug?.avatar ?? null}
				/>
				<PageLoader />
			</PageContent>
		);
	}

	return (
		<PageContent className={cn({ 'min-w-[fit-content]': isMobile })} onBack={handleBack}>
			<CustomHead
				main={daoBySlug?.name ?? ''}
				additional={t('pages.achievements.all.achievementDetails.title')}
				description={daoBySlug?.description ?? ''}
				avatar={daoBySlug?.avatar ?? null}
			/>
			<Title1 className="mb-6 hidden lg:flex">{t('pages.achievements.all.achievementDetails.title')}</Title1>
			<MobileHeader withBurger title={t('pages.achievements.all.achievementDetails.title')} />

			<DetailsLayout artworks={achievementTier?.artworks} artworksTotalLength={achievementTier?.artworks.length || 0}>
				<DetailsHead
					openseaUrl={tierOpenseaUrl}
					collectionName={achievementTier?.collectionName || ''}
					tierName={achievementTier?.tierName}
					owner={isOwnedByCurrentUser ? ownerProps : undefined}
					isMobile={isMobile}
				/>
			</DetailsLayout>
			<div className={cn(wrapperClass, 'px-4 pt-4 sm:px-6')}>
				<div className="mb-4 flex pb-0" data-testid="NftCard__tabs">
					<div>
						<NftDescription text={achievementTier?.description || ''} />
					</div>
				</div>
				{
					<div>
						<Title2>{t('components.achievements.details.labelsTitle')}</Title2>
						<div className="flex flex-auto flex-wrap gap-1.5 pt-4">
							{badges.map((item, ind) => (
								<Badge
									key={ind}
									title={item.title}
									isColored={item.isColored}
									detailClass={'text-[12px] max-h-[28px] py-2 px-3'}
								/>
							))}
						</div>
					</div>
				}
			</div>
			{achievementTier?.owners.length !== 0 && (
				<div className={cn(wrapperClass, 'px-2 sm:px-3')}>
					<Owners
						owners={ownersHashMap || []}
						collectionAddress={achievementTier?.collectionAddress || ''}
						slug={slug}
						tier={tierId}
						isMobile={isMobile}
					/>
				</div>
			)}
			<div className="flex items-center gap-2 pt-10 pb-4 sm:pb-8">
				<Title3>{achievementTier?.collectionName}</Title3>
				{!!collectionNfts?.length && <Title3 color={colors.foregroundTertiary}>{collectionNfts?.length}</Title3>}
			</div>
			<AchievementsNfts
				isMobile={isMobile}
				currentUserAddress={currentUser?.walletAddress || undefined}
				slug={slug}
				nfts={getNfts}
			/>
		</PageContent>
	);
};

AchievementDetails.getLayout = getDaoLayout;

export default AchievementDetails;

export const getServerSideProps = SSR(async (ctx) => {
	const slug = ctx.params?.slug;
	const userID = ctx.req.session?.userId ? ctx.req.session.userId : null;
	const { id } = ctx.query;

	if (!isString(slug) || !isString(id)) return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao?.contractAddress) return { notFound: true };
	if (dao.mode !== DaoMode.Achievements) return { notFound: true };

	let userByIdOrSlug = null;
	if (isAuthorized) {
		userByIdOrSlug = await getUserByIdOrSlug(queryClient, ctx, { idOrSlug: userID });
	}
	const [, currentUser] = await checkAuth(ctx);

	const isSharingEnabled = getIsFeatureEnabled(FEATURES.SHARING_PREVIEW, ctx);
	const isCurrentUser = userByIdOrSlug ? userByIdOrSlug.id === currentUser?.id : false;
	const protocol = getProtocol(ctx);

	return {
		props: {
			slug: dao.slug,
			daoAddress: dao.contractAddress,
			daoName: dao.name,
			collectionOpenseaUrl: dao.openseaUrl,
			userId: userID,
			isMobile: isMobile({ ua: ctx.req }),
			tierId: id,
			isCurrentUser,
			isSharingEnabled,
			protocol,
			currentUser: userByIdOrSlug,
			...getProps()
		}
	};
});
