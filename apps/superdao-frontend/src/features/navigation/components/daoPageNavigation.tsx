import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { useCallback, useMemo, useRef } from 'react';
import isEmpty from 'lodash/isEmpty';
import cn from 'classnames';
import {
	OutlineInformationIcon,
	OutlineMembersIcon,
	OutlineTreasuryIcon,
	OutlineFeedIcon,
	OutlineVotingIcon,
	BadgeIcon,
	TopIcon,
	MapIcon,
	HomeIcon,
	FeedScoringIcon
} from 'src/components/assets/icons';
import { AuthAPI } from 'src/features/auth/API';
import { useCurrentUserMemberRoleQuery } from 'src/gql/daoMembership.generated';
import { useDaoBySlugQuery } from 'src/gql/daos.generated';

import { CustomLink, Label1, SubHeading } from 'src/components';
import { isAdmin } from 'src/utils/roles';
import { useCurrentUserQuery } from 'src/gql/user.generated';
import { DaoMode } from 'src/types/types.generated';
import { LevelComponent } from 'src/pagesComponents/achievements/shared/level';
import { useGetAchievementsUserProgressQuery } from 'src/gql/achievements.generated';
import { NavigationMetaInfo } from './navigationMetaInfo';
import { DaoPageNavigationTab } from './daoPageNavigationTab';
import { UnauthorizedNavigationUserProfile } from './unauthorizedNavigationUserProfile';
import { DaoPageNavigationSettingsTab } from './daoPageNavigationSettingsTab';
import { DaoPageNavigationDocumentsTab } from './daoPageNavigationDocumentsTab';

import { DAO_TABS as TABS } from '../types';
import { usePreventScrollWhenHeightChanges } from '../hooks/usePreventScrollWhenHeightChanges';
import { NestedNavigation } from './nestedPageNavigationTab';
import Tooltip from 'src/components/tooltip';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';
import { useEarlyAdoptersAudienceCounterQuery } from 'src/gql/audienceEarlyAdopters.generated';
import { formatToCompactNotation } from 'src/utils/formattes';

type Props = {
	toggleIsNavigationShown: () => void;
};

export const DaoPageNavigation = (props: Props) => {
	const { toggleIsNavigationShown } = props;

	const { t } = useTranslation();
	const { query, asPath, pathname } = useRouter();
	const { slug } = query;

	const isAuthorized = AuthAPI.useIsAuthorized();

	const { data: daoData, isLoading: isDaoLoading } = useDaoBySlugQuery({ slug: slug as string }, { enabled: !!slug });
	const { name, membersCount, avatar, id, documents, isVotingEnabled, mode } = daoData?.daoBySlug || {};

	const { data: roleData, isLoading: isRoleLoading } = useCurrentUserMemberRoleQuery(
		{ daoId: id! },
		{ enabled: isAuthorized && !!id }
	);
	const { currentUserMemberRole } = roleData || {};

	const isLoading = isDaoLoading || isRoleLoading;

	const isCreator = isAdmin(currentUserMemberRole);
	const hasDaoAccess = !!currentUserMemberRole;

	const { data: currentUserData } = useCurrentUserQuery();
	const { currentUser } = currentUserData || {};
	const userIdOrSlug = currentUser?.id || currentUser?.slug;
	const isAchievementsDao = mode === DaoMode.Achievements;

	const { data: dataLevel } = useGetAchievementsUserProgressQuery(
		{
			userId: userIdOrSlug as string,
			daoId: id as string
		},
		{ enabled: isAchievementsDao }
	);
	const { level } = dataLevel?.getAchievementsUserProgress || {};

	const { data: earlyAdoptersCounter } = useEarlyAdoptersAudienceCounterQuery(
		{ daoId: id as string },
		{
			keepPreviousData: true,
			select: (data) => data.earlyAdoptersAudience.total,
			cacheTime: 0
		}
	);

	const getCurrentDaoTab = useCallback((): TABS => {
		let routeSteps: any = asPath.split('#')[0]; // remove hash (#docs) on /edit page
		routeSteps = routeSteps.split('/');
		const currentDaoTab = routeSteps.length > 2 ? (routeSteps[2] as TABS) : ('about' as TABS);
		const currentCustomTab = routeSteps.length >= 4 ? (routeSteps[3] as TABS) : (routeSteps[2] as TABS);
		if (isAchievementsDao) return currentCustomTab;
		return currentDaoTab;
	}, [asPath, isAchievementsDao]);

	const metaInfoAdditional = t('components.daoList.members', { count: membersCount });

	const achievementsDaoTabs = [
		{
			link: `/${slug}/achievements/all`,
			icon: <BadgeIcon width={24} height={24} />,
			content: t('pages.achievements.all.title'),
			isActive: getCurrentDaoTab() === TABS.ALL,
			isLocked: false,
			canBeLocked: false,
			achievementLevel: <></>,
			children: []
		},
		{
			link: `/${slug}/achievements/leaderboard`,
			icon: <TopIcon width={24} height={24} />,
			content: t('pages.achievements.leaderboard.title'),
			isActive: getCurrentDaoTab() === TABS.LEADERBOARD,
			isLocked: false,
			canBeLocked: false,
			achievementLevel: false,
			children: []
		}
	];
	if (isAuthorized) {
		achievementsDaoTabs.unshift({
			link: `/${slug}/achievements/levels`,
			icon: <MapIcon width={24} height={24} />,
			content: t('pages.achievements.levels.title'),
			isActive: getCurrentDaoTab() === TABS.LEVELS,
			isLocked: false,
			canBeLocked: false,
			achievementLevel: <></>,
			children: []
		});
	}

	if (hasDaoAccess) {
		achievementsDaoTabs.unshift({
			link: `/${slug}/achievements/profile/${userIdOrSlug}`,
			icon: <HomeIcon width={24} height={24} />,
			content: t('pages.achievements.profile.title'),
			isActive: getCurrentDaoTab() === TABS.PROFILE,
			isLocked: false,
			canBeLocked: false,
			achievementLevel: <>{!!level && <LevelComponent className="ml-[unset]" level={level} />}</>,
			children: []
		});
	}

	if (isCreator) {
		achievementsDaoTabs.unshift({
			link: `/${slug}`,
			icon: <OutlineInformationIcon width={24} height={24} />,
			content: t('components.dao.navigation.links.about'),
			isActive: getCurrentDaoTab() === TABS.ABOUT,
			isLocked: false,
			canBeLocked: false,
			achievementLevel: false,
			children: []
		});

		achievementsDaoTabs.push({
			link: `/${slug}/members`,
			icon: <OutlineMembersIcon width={24} height={24} />,
			content: t('components.dao.navigation.links.members'),
			isActive: getCurrentDaoTab() === TABS.MEMBERS,
			isLocked: false,
			canBeLocked: false,
			achievementLevel: false,
			children: []
		});
	}

	const basicDaoTabs = [
		{
			link: `/${slug}`,
			icon: <OutlineInformationIcon width={24} height={24} />,
			content: t('components.dao.navigation.links.about'),
			isActive: getCurrentDaoTab() === TABS.ABOUT,
			isLocked: false,
			canBeLocked: false,
			achievementLevel: false,
			children: []
		},
		{
			link: `/${slug}/members`,
			icon: <OutlineMembersIcon width={24} height={24} />,
			content: t('components.dao.navigation.links.members'),
			isActive: getCurrentDaoTab() === TABS.MEMBERS,
			isLocked: false,
			canBeLocked: false,
			achievementLevel: false,
			children: []
		},
		{
			link: `/${slug}/treasury`,
			icon: <OutlineTreasuryIcon width={24} height={24} />,
			content: t('components.dao.navigation.links.treasury'),
			isActive: getCurrentDaoTab() === TABS.TREASURY,
			isLocked: false,
			canBeLocked: false,
			achievementLevel: false,
			children: []
		}
	];

	const navigationTabsPrefab = isAchievementsDao ? achievementsDaoTabs : basicDaoTabs;

	const navigationTabs = useMemo(() => {
		if (isVotingEnabled) {
			navigationTabsPrefab.push({
				link: `/${slug}/voting`,
				icon: <OutlineVotingIcon width={24} height={24} />,
				content: t('components.dao.navigation.links.voting'),
				isActive: getCurrentDaoTab() === TABS.VOTING,
				isLocked: !hasDaoAccess,
				canBeLocked: true,
				achievementLevel: false,
				children: []
			});
		}

		navigationTabsPrefab.push({
			link: `/${slug}/feed`,
			icon: <OutlineFeedIcon width={24} height={24} />,
			content: t('components.dao.navigation.links.feed'),
			isActive: getCurrentDaoTab() === TABS.FEED,
			isLocked: !hasDaoAccess,
			canBeLocked: true,
			achievementLevel: false,
			children: []
		});

		return navigationTabsPrefab;
	}, [navigationTabsPrefab, isVotingEnabled, slug, t, getCurrentDaoTab, hasDaoAccess]);

	const divRef = useRef<HTMLDivElement>(null);
	usePreventScrollWhenHeightChanges(divRef);

	const tabsContent = navigationTabs.map((navigationTab) => (
		<div key={navigationTab.link} className="mx-3 w-full" data-testid={`DaoMenu__${navigationTab.content}`}>
			{isEmpty(navigationTab.children) ? (
				<CustomLink href={navigationTab.link} pathname={pathname} passHref>
					{(_highlighted) => {
						return (
							<a className="w-full">
								<DaoPageNavigationTab
									icon={navigationTab.icon}
									content={navigationTab.content}
									isActive={navigationTab.isActive}
									isLocked={navigationTab.isLocked}
									canBeLocked={navigationTab.canBeLocked}
									toggleIsNavigationShown={toggleIsNavigationShown}
									isSkeletonMode={isLoading}
									achievementLevel={navigationTab.achievementLevel}
								/>
							</a>
						);
					}}
				</CustomLink>
			) : (
				<NestedNavigation
					navigationTab={navigationTab}
					isLoading={isLoading}
					toggleIsNavigationShown={toggleIsNavigationShown}
				/>
			)}
		</div>
	));

	return (
		<div className={`flex h-full flex-wrap overflow-auto ${isAuthorized ? 'pb-6' : ''}`} ref={divRef}>
			<div className="w-full">
				<NavigationMetaInfo
					className="h-max"
					isSkeletonMode={isLoading}
					id={id}
					avatar={avatar}
					main={name}
					additional={metaInfoAdditional}
				/>

				<div className="flex h-max flex-wrap items-start gap-2">{tabsContent}</div>

				{isCreator && (
					<DaoPageNavigationSettingsTab
						slug={slug as string}
						currentDaoTab={getCurrentDaoTab()}
						toggleIsNavigationShown={toggleIsNavigationShown}
						isSkeletonMode={isLoading}
					/>
				)}

				{!isAchievementsDao && (
					<DaoPageNavigationDocumentsTab
						toggleIsNavigationShown={toggleIsNavigationShown}
						documents={documents}
						isCreator={isCreator}
						isSkeletonMode={isLoading}
					/>
				)}
			</div>

			{!isAuthorized && <UnauthorizedNavigationUserProfile />}
		</div>
	);
};
