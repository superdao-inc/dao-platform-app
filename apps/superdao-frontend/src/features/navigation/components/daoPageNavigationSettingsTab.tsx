import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { CustomLink, OutlineDistributeIcon, OutlinePenIcon, OutlineSettingsIcon } from 'src/components';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';
import { Label1 } from 'src/components/text';

import { DaoPageNavigationTab } from './daoPageNavigationTab';
import { DAO_TABS, DAO_TABS as TABS } from 'src/features/navigation/types';

type Props = {
	slug: string;
	currentDaoTab: DAO_TABS;
	toggleIsNavigationShown: () => void;
	isSkeletonMode: boolean;
};

export const DaoPageNavigationSettingsTab = (props: Props) => {
	const { slug, currentDaoTab, toggleIsNavigationShown, isSkeletonMode } = props;

	const { pathname } = useRouter();

	const { t } = useTranslation();

	const distributeTabs = [TABS.DISTRIBUTE, TABS.PUBLIC_SALE, TABS.PRIVATE_SALE, TABS.AIRDROP, TABS.WHITELIST];

	return (
		<div className="mx-3 mt-6 h-max">
			<Label1 className="text-foregroundSecondary ml-3 mb-2">
				{isSkeletonMode ? (
					<SkeletonComponent variant="rectangular" className="h-3 w-20" />
				) : (
					t('components.dao.navigation.section.settings')
				)}
			</Label1>
			<div className="flex flex-col gap-2">
				<CustomLink href={`/${slug}/settings/about/edit`} pathname={pathname} passHref>
					{(_highlighted) => {
						return (
							<a className="w-full" data-testid={'DaoMenu__Settings'}>
								<DaoPageNavigationTab
									icon={<OutlineSettingsIcon width={24} height={24} />}
									content={t('components.dao.navigation.links.general')}
									isActive={currentDaoTab?.toUpperCase().includes(TABS.SETTINGS.toUpperCase())}
									toggleIsNavigationShown={toggleIsNavigationShown}
									isSkeletonMode={isSkeletonMode}
								/>
							</a>
						);
					}}
				</CustomLink>
				<CustomLink href={`/${slug}/custom`} pathname={pathname} passHref>
					{(_highlighted) => {
						return (
							<a className="w-full" data-testid={'DaoMenu__Customize'}>
								<DaoPageNavigationTab
									icon={<OutlinePenIcon width={24} height={24} />}
									content={t('components.dao.navigation.links.customize')}
									isActive={currentDaoTab === TABS.CUSTOM}
									toggleIsNavigationShown={toggleIsNavigationShown}
									isSkeletonMode={isSkeletonMode}
								/>
							</a>
						);
					}}
				</CustomLink>
				<CustomLink href={`/${slug}/distribute`} pathname={pathname} passHref>
					{(_highlighted) => {
						return (
							<a className="w-full" data-testid={'DaoMenu__Distribute'}>
								<DaoPageNavigationTab
									icon={<OutlineDistributeIcon width={24} height={24} />}
									content={t('components.dao.navigation.links.distribute')}
									isActive={distributeTabs.includes(currentDaoTab)}
									toggleIsNavigationShown={toggleIsNavigationShown}
									isSkeletonMode={isSkeletonMode}
								/>
							</a>
						);
					}}
				</CustomLink>
			</div>
		</div>
	);
};
