import { useTranslation } from 'next-i18next';

import { Label1 } from 'src/components/text';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';
import { AuthAPI } from 'src/features/auth/API';

import { NavigationMetaInfo } from './navigationMetaInfo';
import { DaoPageNavigationTab } from './daoPageNavigationTab';
import { UnauthorizedNavigationUserProfile } from './unauthorizedNavigationUserProfile';

export const SkeletonNavigation = () => {
	const { t } = useTranslation();

	const isAuthorized = AuthAPI.useIsAuthorized();

	return (
		<div className="flex h-full flex-wrap">
			<div className="w-full">
				<NavigationMetaInfo className="h-max" isSkeletonMode />
				<div className="mx-3 flex h-max flex-wrap items-start gap-2">
					<DaoPageNavigationTab
						icon={<SkeletonComponent variant="circular" className="h-6 w-6" />}
						content={<SkeletonComponent variant="rectangular" className="h-4 w-[100px]" />}
						isActive={false}
					/>
					<DaoPageNavigationTab
						icon={<SkeletonComponent variant="circular" className="h-6 w-6" />}
						content={<SkeletonComponent variant="rectangular" className="h-4 w-[100px]" />}
						isActive={false}
					/>
					<DaoPageNavigationTab
						icon={<SkeletonComponent variant="circular" className="h-6 w-6" />}
						content={<SkeletonComponent variant="rectangular" className="h-4 w-[100px]" />}
						isActive={false}
					/>
				</div>

				<div className="mx-3 mt-6 h-max">
					<SkeletonComponent variant="rectangular" className="text-foregroundSecondary ml-3 mb-2 h-4 w-20" />
					<DaoPageNavigationTab
						icon={<SkeletonComponent variant="circular" className="h-6 w-6" />}
						content={<SkeletonComponent variant="rectangular" className="h-4 w-[100px]" />}
						isActive={false}
					/>
				</div>

				<div className="mx-3 mt-6 flex h-max flex-wrap gap-2">
					<Label1 className="text-foregroundSecondary ml-3">{t('components.dao.navigation.links.documents')}</Label1>
					<DaoPageNavigationTab
						icon={<SkeletonComponent variant="circular" className="h-6 w-6" />}
						content={<SkeletonComponent variant="rectangular" className="h-4 w-[100px]" />}
						isActive={false}
					/>
					<DaoPageNavigationTab
						icon={<SkeletonComponent variant="circular" className="h-6 w-6" />}
						content={<SkeletonComponent variant="rectangular" className="h-4 w-[100px]" />}
						isActive={false}
					/>
				</div>
			</div>

			{!isAuthorized && <UnauthorizedNavigationUserProfile />}
		</div>
	);
};
