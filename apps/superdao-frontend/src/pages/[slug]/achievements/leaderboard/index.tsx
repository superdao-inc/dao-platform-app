import isMobile from 'is-mobile';

import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import countBy from 'lodash/countBy';
import identity from 'lodash/identity';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import union from 'lodash/union';
import uniq from 'lodash/uniq';
import { LeaderboardContent } from 'src/pagesComponents/achievements/leaderboardContent';
import { prefetchData, SSR } from 'src/client/ssr';
import { MobileHeader } from 'src/components/mobileHeader';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { DaoMode } from 'src/types/types.generated';

import { useDebounce } from 'src/hooks';

import { Button, PageContent, Title1, PageLoader } from 'src/components';
import { DaoMembersSearch } from 'src/pagesComponents/dao/daoMembersSearch';

import { getDaoWithRoles } from 'src/client/commonRequests';
import { useDaoBySlugWithRolesQuery } from 'src/gql/daos.generated';

import { CustomHead } from 'src/components/head';
import { useGetAchievementsLeaderboardQuery } from 'src/gql/achievements.generated';

type Props = {
	hostname: string;
	daoId: string;
	slug: string;
	isMobile: boolean;
};

type FilterItemProps = {
	label: string;
	count: number | null | undefined;
	activeValue?: string;
	filterValue?: string;
	onClick: () => void;
};

const FilterItem = ({ label, count, activeValue, filterValue, onClick }: FilterItemProps) => {
	const isActive = activeValue === filterValue;
	const activeRef = useRef<HTMLDivElement>(null);
	const btnLabel = (
		<>
			{label}
			<span className={cn(isActive ? 'text-[#fff]' : 'text-foregroundSecondary', 'pl-1')}>{count}</span>
		</>
	);

	useEffect(() => {
		isActive && activeRef?.current?.scrollIntoView({ block: 'end', inline: 'nearest', behavior: 'smooth' });
	}, [isActive]);

	return (
		<div ref={activeRef}>
			<Button
				className="whitespace-nowrap rounded-full"
				key={label}
				color={isActive ? 'accentPrimary' : 'overlayTertiary'}
				size="md"
				onClick={onClick}
				label={btnLabel}
			/>
		</div>
	);
};

const Leaderboard: NextPageWithLayout<Props> = ({ slug, daoId }) => {
	const { data } = useDaoBySlugWithRolesQuery({ slug });
	const { daoBySlug } = data || {};
	const { t } = useTranslation();

	const [filterValue, setFilterValue] = useState<string>();
	const [searchValue, setSearchValue] = useState('');
	const debouncedSearch = useDebounce(searchValue, 400);

	const { data: daoData } = useDaoBySlugWithRolesQuery({ slug });

	const { data: membersData, isLoading } = useGetAchievementsLeaderboardQuery(
		{
			daoId,
			search: debouncedSearch
		},
		{
			keepPreviousData: true,
			select: (data) => data.getAchievementsLeaderboard
		}
	);

	// const roleFilters = uniq(flatten(membersData?.map((member) => member.tiers)));
	// const filtersCount = countBy(flatten(membersData?.map((member) => member.tiers)), identity);

	const roles = membersData?.map((member) => String(member.role));
	const roleFilters = uniq(roles);
	const filtersCount = countBy(roles, identity);

	const filters = useMemo(
		() =>
			union(
				[
					{
						label: t('pages.dao.members.filter.all'),
						count: membersData?.length ?? 0,
						onClick: () => setFilterValue(undefined),
						activeValue: undefined
					}
				],
				roleFilters.map((filter) => ({
					label: filter,
					count: filtersCount[filter],
					onClick: () => setFilterValue(filter),
					activeValue: filter || undefined
				}))
			),
		[membersData, t, filtersCount, roleFilters]
	);

	const filteredMembers = useMemo(
		() => (!isNil(filterValue) ? membersData?.filter((member) => String(member.role) === filterValue) : membersData),
		[filterValue, membersData]
	);

	if (isLoading) {
		return (
			<PageContent className="items-center">
				<CustomHead
					main={daoData?.daoBySlug?.name ?? 'Leaderboard'}
					additional={daoData?.daoBySlug?.name ?? 'Superdao'}
					description={daoData?.daoBySlug?.description ?? ''}
					avatar={daoData?.daoBySlug?.avatar ?? null}
				/>

				<PageLoader />
			</PageContent>
		);
	}

	if (!daoBySlug) return null;

	return (
		<PageContent className="!px-0">
			<CustomHead
				main={daoBySlug?.name ?? ''}
				additional={'Leaderboard'}
				description={daoBySlug?.description ?? ''}
				avatar={daoBySlug?.avatar ?? null}
			/>
			<Title1 className="mb-6 hidden lg:flex">{t('pages.achievements.leaderboard.title')}</Title1>
			<MobileHeader className="px-4" withBurger title={t('pages.achievements.leaderboard.title')} />

			<>
				<div className={cn('z-5 top-[56px] flex justify-between px-4 pt-1 pb-0 lg:static lg:px-0 lg:pb-4 lg:pt-0')}>
					<DaoMembersSearch value={searchValue} onChange={setSearchValue} />
				</div>

				<main className="lg:bg-backgroundSecondary flex flex-col overflow-hidden rounded-lg py-5 lg:px-3">
					<div className="scrollbar-hide -ml-4 -mr-4 mb-3 flex shrink-0 flex-nowrap items-center gap-3 overflow-auto px-8 lg:-ml-3 lg:-mr-3 lg:mb-5 lg:px-6">
						{!isEmpty(roleFilters) &&
							filters.map((item) => <FilterItem key={item.label} filterValue={filterValue} {...item} />)}
					</div>
					<LeaderboardContent daoSlug={slug} members={filteredMembers} />
				</main>
			</>
		</PageContent>
	);
};

Leaderboard.getLayout = getDaoLayout;

export default Leaderboard;

export const getServerSideProps = SSR(async (ctx) => {
	const slug = ctx.params?.slug;

	if (typeof slug !== 'string') return { notFound: true };

	const [queryClient, getProps, isAuthorized] = await prefetchData(ctx);

	const dao = await getDaoWithRoles(queryClient, ctx, { slug }, isAuthorized);
	if (!dao) return { notFound: true };
	if (dao.mode !== DaoMode.Achievements) return { notFound: true };

	return {
		props: {
			slug: dao.slug,
			daoId: dao.id,
			isMobile: isMobile({ ua: ctx.req }),
			...getProps()
		}
	};
});
