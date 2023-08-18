import Link from 'next/link';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Tooltip from 'src/components/tooltip';
import { colors } from 'src/style';
import { UserAvatar } from 'src/components/common/avatar';
import { TooltipContent } from 'src/components/navigation/tooltipContent';
import { useHasNewNotificationsQuery } from 'src/gql/notification.generated';
import { UserAPI } from 'src/features/user/API';
import { PATH_PROFILE } from 'src/features/user/constants';

export const ProfileNav = () => {
	const { asPath } = useRouter();
	const { t } = useTranslation();

	const { data: user } = UserAPI.useCurrentUserQuery();
	const { currentUser: userData } = user || {};
	const { id, avatar, slug } = userData || {};

	const { data: hasNotificationData } = useHasNewNotificationsQuery(
		{},
		{
			enabled: false, // isAuthorized,
			refetchInterval: 7000
		}
	);
	const { hasNewNotifications } = hasNotificationData || {};

	const isProfileActive = asPath.startsWith(`/users/${id}`) || asPath.startsWith(`/users/${slug}`);

	return (
		<div>
			<Tooltip content={<TooltipContent title={t('tooltips.navigation.profile.description')} />} placement="right">
				<Link href={PATH_PROFILE} passHref>
					<ProfileLink data-testid="ProfileLink">
						<StyledUserAvatar
							isActive={isProfileActive}
							hasNotification={!!hasNewNotifications}
							seed={id}
							fileId={avatar}
							size="xs"
						/>
					</ProfileLink>
				</Link>
			</Tooltip>
		</div>
	);
};

const ProfileLink = styled.a`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 16px 20px;
	margin-bottom: 8px;
	transition: background-color 300ms;

	&:hover {
		background-color: ${colors.overlaySecondary};
	}
`;

const StyledUserAvatar = styled(UserAvatar)<{ isActive: boolean; hasNotification: boolean }>`
	position: relative;
	outline: ${(props) => props.isActive && `4px solid ${colors.accentPrimary}`};
	border-radius: 50%;

	> div {
		outline: 2px solid ${colors.backgroundTertiary};
	}

	&:after {
		display: ${(props) => (props.hasNotification ? 'block' : 'none')};
		position: absolute;
		content: '';
		top: -2px;
		right: -2px;

		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: ${colors.tintCyan};
		outline: 2px solid ${colors.backgroundTertiary};
	}
`;
