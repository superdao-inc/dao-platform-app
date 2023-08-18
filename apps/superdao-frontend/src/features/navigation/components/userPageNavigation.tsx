import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { OutlineProfileIcon } from 'src/components/assets/icons';
import { AuthAPI } from 'src/features/auth/API';
import { UserByIdOrSlugQuery } from 'src/gql/user.generated';
import { shrinkWallet } from '@sd/superdao-shared';

import { NavigationMetaInfo } from './navigationMetaInfo';
import { DaoPageNavigationTab } from './daoPageNavigationTab';
import { UnauthorizedNavigationUserProfile } from './unauthorizedNavigationUserProfile';

import { USER_TABS as TABS } from '../types';
import { CustomLink } from 'src/components';

type Props = {
	user?: UserByIdOrSlugQuery['userByIdOrSlug'];
	toggleIsNavigationShown: () => void;
};

export const UserPageNavigation = (props: Props) => {
	const { user: userByIdOrSlug, toggleIsNavigationShown } = props;

	const { t } = useTranslation();
	const { query, pathname } = useRouter();
	const { idOrSlug } = query;

	const isAuthorized = AuthAPI.useIsAuthorized();

	const getCurrentUserTab = (): TABS => {
		return 'profile' as TABS;
	};

	const userDisplayName = userByIdOrSlug?.displayName || userByIdOrSlug?.ens || userByIdOrSlug?.walletAddress;

	const navigationTabs = [
		{
			link: `/users/${idOrSlug}`,
			icon: <OutlineProfileIcon width={24} height={24} />,
			content: t('components.dao.navigation.links.profile'),
			isActive: getCurrentUserTab() === TABS.PROFILE,
			isLocked: false
		}
	];

	return (
		<div className="flex h-full flex-wrap overflow-auto">
			<div className="w-full">
				<NavigationMetaInfo
					className="h-max"
					isSkeletonMode={false}
					id={userByIdOrSlug?.id}
					avatar={userByIdOrSlug?.avatar}
					main={userDisplayName}
					additional={shrinkWallet(userByIdOrSlug?.walletAddress ?? '')}
					isUser={true}
				/>
				<div className="flex h-max flex-wrap items-start gap-2">
					{navigationTabs.map((navigationTab) => (
						<div key={navigationTab.link} className="mx-3 w-full">
							<CustomLink href={navigationTab.link} pathname={pathname} passHref>
								{(_highlighted) => {
									return (
										<a className="w-full">
											<DaoPageNavigationTab
												icon={navigationTab.icon}
												content={navigationTab.content}
												isActive={navigationTab.isActive}
												isLocked={navigationTab.isLocked}
												toggleIsNavigationShown={toggleIsNavigationShown}
											/>
										</a>
									);
								}}
							</CustomLink>
						</div>
					))}
				</div>
			</div>

			{!isAuthorized && <UnauthorizedNavigationUserProfile />}
		</div>
	);
};
