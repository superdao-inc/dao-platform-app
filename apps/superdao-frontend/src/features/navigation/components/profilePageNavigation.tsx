import { MouseEvent, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { EmotionJSX } from '@emotion/react/types/jsx-namespace';
import {
	LogoutIcon,
	OutlineInformationIcon,
	OutlineProfileIcon,
	OutlineSettingsIcon
} from 'src/components/assets/icons';
import { AuthAPI } from 'src/features/auth/API';
import { useCurrentUserQuery } from 'src/gql/user.generated';
import { shrinkWallet } from '@sd/superdao-shared';

import { NavigationMetaInfo } from './navigationMetaInfo';
import { DaoPageNavigationTab } from './daoPageNavigationTab';
import { Button, CustomLink, Label1 } from 'src/components';

import {
	PATH_PROFILE_ABOUT,
	PATH_PROFILE_EDIT,
	PATH_PROFILE,
	PATH_PROFILE_EMAIL_SETTINGS
} from 'src/features/user/constants';
import { usePreventScrollWhenHeightChanges } from '../hooks/usePreventScrollWhenHeightChanges';
import { EmailIcon } from 'src/components/assets/icons/email';

type NavigationTab = {
	link: string;
	icon: EmotionJSX.Element;
	content: string;
	pathname: string;
	active?: boolean;
};

type NavigationItemProps = {
	toggleIsNavigationShown(): void;
} & NavigationTab;

const NavigationItem = ({
	link,
	icon,
	content,
	pathname,
	active = false,
	toggleIsNavigationShown
}: NavigationItemProps) => {
	const { t } = useTranslation();

	return (
		<div className="mx-3 w-full" data-testid={`ProfileMenu__${content}`}>
			<CustomLink href={link} pathname={pathname} passHref>
				{(_highlighted) => {
					return (
						<a className="w-full">
							<DaoPageNavigationTab
								icon={icon}
								content={t(content)}
								isActive={active}
								isLocked={false}
								toggleIsNavigationShown={toggleIsNavigationShown}
							/>
						</a>
					);
				}}
			</CustomLink>
		</div>
	);
};

const navigationTabs: NavigationTab[] = [
	{
		link: PATH_PROFILE,
		icon: <OutlineProfileIcon width={24} height={24} />,
		content: 'components.dao.navigation.links.profile',
		pathname: PATH_PROFILE
	},
	{
		link: PATH_PROFILE_ABOUT,
		icon: <OutlineInformationIcon width={24} height={24} />,
		content: 'components.dao.navigation.links.about',
		pathname: PATH_PROFILE_ABOUT
	}
];

const settingsNavigationTabs: NavigationTab[] = [
	{
		link: PATH_PROFILE_EDIT,
		icon: <OutlineSettingsIcon width={24} height={24} />,
		content: 'components.dao.navigation.links.generalSettings',
		pathname: PATH_PROFILE_EDIT
	},
	{
		link: PATH_PROFILE_EMAIL_SETTINGS,
		icon: <EmailIcon width={24} height={24} />,
		content: 'components.dao.navigation.links.emailSettings',
		pathname: PATH_PROFILE_EMAIL_SETTINGS
	}
];

type Props = {
	toggleIsNavigationShown: () => void;
};

export const ProfilePageNavigation = (props: Props) => {
	const { toggleIsNavigationShown } = props;

	const { t } = useTranslation();
	const { pathname } = useRouter();

	const isAuthorized = AuthAPI.useIsAuthorized();
	const { mutate: logout } = AuthAPI.useLogout();

	const { data: currentUserData, isLoading: isCurrentUserLoading } = useCurrentUserQuery();
	const { currentUser } = currentUserData || {};

	const isLoading = isCurrentUserLoading;

	const handleLogout = (e: MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		logout({});
	};

	const userDisplayName = currentUser?.displayName || currentUser?.ens || currentUser?.walletAddress;

	const divRef = useRef<HTMLDivElement>(null);
	usePreventScrollWhenHeightChanges(divRef);

	return (
		<div className="flex h-full flex-wrap overflow-auto" ref={divRef}>
			<div className="w-full">
				<NavigationMetaInfo
					className="h-max"
					isSkeletonMode={isLoading}
					id={currentUser?.id}
					avatar={currentUser?.avatar}
					main={userDisplayName}
					additional={shrinkWallet(currentUser?.walletAddress ?? '')}
					isUser={true}
				/>
				<div className="flex h-max flex-wrap items-start gap-2">
					{navigationTabs.map((tab, index) => (
						<NavigationItem
							key={index}
							active={pathname === tab.pathname}
							toggleIsNavigationShown={toggleIsNavigationShown}
							{...tab}
						/>
					))}
					<Label1 className="text-foregroundSecondary ml-6 mt-3">
						{t('components.dao.navigation.links.settings')}
					</Label1>
					{settingsNavigationTabs.map((tab, index) => (
						<NavigationItem
							key={index}
							active={pathname === tab.pathname}
							toggleIsNavigationShown={toggleIsNavigationShown}
							{...tab}
						/>
					))}
				</div>
			</div>

			{isAuthorized && (
				<div className="mx-3 mt-auto w-full">
					<div
						className="hover:bg-overlaySecondary my-5 w-full cursor-pointer rounded-lg transition-all"
						onClick={handleLogout}
						data-testid={'ProfileMenu__Log out'}
					>
						<Button
							size="md"
							className="foregroundPrimary"
							color={'transparent'}
							label={t('components.user.actions.logout')}
							leftIcon={<LogoutIcon />}
						/>
					</div>
				</div>
			)}
		</div>
	);
};
