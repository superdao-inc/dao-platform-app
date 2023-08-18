import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { UserAvatar } from 'src/components';

import { TooltipContent } from 'src/components/navigation/tooltipContent';
import { SkeletonComponent } from 'src/components/skeletonBaseComponent';
import Tooltip from 'src/components/tooltip';
import { AuthAPI } from 'src/features/auth/API';
import { UserAPI } from 'src/features/user';
import { PATH_PROFILE } from 'src/features/user/constants';
import { useLayoutContext } from 'src/providers/layoutProvider';

export const CommonNavigationUserBlock = () => {
	const [, { toggle: toggleIsNavigationShown }] = useLayoutContext();

	const { t } = useTranslation();
	const { push, asPath, query } = useRouter();
	const { idOrSlug } = query;

	const isAuthorized = AuthAPI.useIsAuthorized();

	const { data: user, isLoading: isUserLoading } = UserAPI.useCurrentUserQuery(undefined, { enabled: isAuthorized });
	const { currentUser: userData } = user || {};

	const isLoading = isUserLoading;

	const handleRedirectToProfile = () => {
		toggleIsNavigationShown();
		push(PATH_PROFILE);
	};

	const isCurrentUser = idOrSlug === userData?.id || idOrSlug === userData?.slug;

	const isActive = asPath.startsWith(PATH_PROFILE) || (asPath.startsWith('/users') && isCurrentUser);

	if (isLoading) {
		return (
			<div className="bottom bg-backgroundTertiary fixed bottom-0 flex w-[64px] touch-none flex-wrap justify-center pb-8">
				<SkeletonComponent variant="circular" className="mx-auto h-10 w-10" />
			</div>
		);
	}

	return (
		<div className="bg-backgroundTertiary mt-6 flex w-[64px] touch-none flex-wrap justify-center pb-5">
			{isAuthorized && (
				<Tooltip
					className="w-full"
					content={<TooltipContent description={t('tooltips.navigation.profile.description')} />}
					placement="right"
				>
					<div
						onClick={handleRedirectToProfile}
						className={`relative flex h-10 w-full cursor-pointer items-center justify-center transition ${
							isActive ? '' : 'hover-firstChild:top-1/4 hover-firstChild:h-3/6'
						}`}
						data-testid={'LeftMenu__profileButton'}
					>
						<div
							className={`bg-accentPrimary absolute left-0 w-[3px] rounded-r-lg transition-all ${
								isActive ? 'top-0 h-10' : 'top-2/4 h-0'
							}`}
						></div>
						<UserAvatar className="cursor-pointer" size="md" seed={userData?.id} fileId={userData?.avatar} />
					</div>
				</Tooltip>
			)}
		</div>
	);
};
