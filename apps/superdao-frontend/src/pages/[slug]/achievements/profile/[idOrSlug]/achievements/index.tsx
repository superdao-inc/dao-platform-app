import isMobile from 'is-mobile';
import { useTranslation } from 'next-i18next';
import countBy from 'lodash/countBy';
import flatten from 'lodash/flatten';
import identity from 'lodash/identity';
import isEmpty from 'lodash/isEmpty';
import union from 'lodash/union';
import uniq from 'lodash/uniq';
import without from 'lodash/without';
import { useMemo, useState } from 'react';
import defaultTo from 'lodash/defaultTo';
import { useRouter } from 'next/router';
import intersection from 'lodash/intersection';
import { getDaoWithRoles, getUserByIdOrSlug } from 'src/client/commonRequests';
import { prefetchData, SSR } from 'src/client/ssr';
import { PageContent, PageLoader, Title1 } from 'src/components';
import { CustomHead } from 'src/components/head';
import { MobileHeader } from 'src/components/mobileHeader';
import { useGetUserAchievementTiersQuery } from 'src/gql/achievements.generated';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { AchievementsNfts } from 'src/pagesComponents/achievements/achievementsPage/page';
import { getAddress } from '@sd/superdao-shared';
import { FilterItem } from 'src/pagesComponents/achievements/shared/labelFilter';
import { MetadataAttributesSdTraits } from 'src/pagesComponents/dao/nftEdit/types';
import { DaoMode } from 'src/types/types.generated';
import cn from 'classnames';

type Props = {
	hostname: string;
	daoAddress: string;
	slug: string;
	isMobile: boolean;
	currentUserAddress?: string;
};

const UserAchievements: NextPageWithLayout<Props> = (props) => {
	const { slug, daoAddress, currentUserAddress, isMobile } = props;
	const [filterValue, setFilterValue] = useState<string[]>([]);

	const { t } = useTranslation();
	const { back } = useRouter();

	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug } = data || {};

	const { data: achievementTiers, isLoading } = useGetUserAchievementTiersQuery(
		{ daoAddress, owner: defaultTo(getAddress(currentUserAddress), '') },
		{
			keepPreviousData: true,
			select: (data) => data.getUserAchievementTiers,
			cacheTime: 0
		}
	);

	const labels = flatten(
		achievementTiers
			?.filter((nft) =>
				nft?.metadata?.attributes?.some(
					(attr) => attr.sdTrait === MetadataAttributesSdTraits.ACHIEVEMENT_LABEL_SD_TRAIT
				)
			)
			.map((nft) => nft.metadata?.attributes)
	)
		.filter((nft) => nft?.sdTrait === MetadataAttributesSdTraits.ACHIEVEMENT_LABEL_SD_TRAIT)
		.map((attr) => attr?.value || '');

	const filtersByLabel = uniq(labels);
	const filtersCount = countBy(labels, identity);

	const filters = useMemo(
		() =>
			union(
				[
					{
						label: t('pages.dao.members.filter.all'),
						count: achievementTiers?.length ?? 0,
						onClick: () => setFilterValue([]),
						activeValue: undefined,
						isActive: isEmpty(filterValue) || filterValue.length === filtersByLabel.length
					}
				],
				filtersByLabel.map((filter) => ({
					label: filter,
					count: filtersCount[filter],
					onClick: () =>
						filterValue.includes(filter)
							? setFilterValue(without(filterValue, filter))
							: setFilterValue([...filterValue, filter]),
					activeValue: filter || undefined,
					isActive: filterValue.includes(filter)
				}))
			),
		[achievementTiers, t, filtersCount, filtersByLabel, filterValue]
	);

	const filteredNfts = useMemo(
		() =>
			!isEmpty(filterValue)
				? achievementTiers?.filter((achievementTier) => {
						const achievements = achievementTier.achievements.map((attr) => attr.valueString);
						return intersection(achievements, filterValue).length === filterValue.length;
				  })
				: achievementTiers,
		[filterValue, achievementTiers]
	);

	if (!daoBySlug) return null;

	if (isLoading) {
		return (
			<PageContent>
				<CustomHead
					main={daoBySlug?.name ?? ''}
					additional={t('pages.achievements.profile.userAchievements.title')}
					description={daoBySlug?.description ?? ''}
					avatar={daoBySlug?.avatar ?? null}
				/>
				<PageLoader />
			</PageContent>
		);
	}

	return (
		<PageContent onBack={back}>
			<CustomHead
				main={daoBySlug?.name ?? ''}
				additional={t('pages.achievements.profile.userAchievements.title')}
				description={daoBySlug?.description ?? ''}
				avatar={daoBySlug?.avatar ?? null}
			/>
			<Title1 className="mb-6 hidden lg:flex">{t('pages.achievements.profile.userAchievements.title')}</Title1>
			<MobileHeader withBurger title={t('pages.achievements.profile.userAchievements.title')} />
			{!isEmpty(labels) && (
				<div className={cn('flex flex-auto flex-wrap gap-3', isMobile ? 'mb-4' : 'mb-10')}>
					{filters.map((item) => (
						<FilterItem key={item.label} {...item} />
					))}
				</div>
			)}
			<AchievementsNfts
				currentUserAddress={currentUserAddress}
				slug={slug}
				nfts={filteredNfts || []}
				isMobile={isMobile}
			/>
		</PageContent>
	);
};

UserAchievements.getLayout = getDaoLayout;

export default UserAchievements;

export const getServerSideProps = SSR(async (ctx) => {
	const userID = ctx.req.session?.userId;
	const slug = ctx.params?.slug;

	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };
	if (dao.mode !== DaoMode.Achievements) return { notFound: true };

	const userByIdOrSlug = await getUserByIdOrSlug(queryClient, ctx, { idOrSlug: userID });
	if (!userByIdOrSlug) return { notFound: true };

	return {
		props: {
			slug: dao.slug,
			daoAddress: dao.contractAddress,
			isMobile: isMobile({ ua: ctx.req }),
			currentUserAddress: userByIdOrSlug?.walletAddress,
			...getProps()
		}
	};
});
