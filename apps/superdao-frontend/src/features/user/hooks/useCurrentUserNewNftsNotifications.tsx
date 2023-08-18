import { UseQueryOptions } from 'react-query';
import { useMemo } from 'react';
import { NotificationType } from 'src/types/types.generated';
import { CurrentUserNotificationsQuery } from 'src/gql/userNotification.generated';
import { useCurrentUserNotificationsQuery } from './useCurrentUserNotificationsQuery';
import { AuthAPI } from 'src/features/auth/API';

export const useCurrentUserNewNftsNotifications = (options?: UseQueryOptions<CurrentUserNotificationsQuery>) => {
	const isAuthorized = AuthAPI.useIsAuthorized();

	const { userNotifications } = useCurrentUserNotificationsQuery({}, { enabled: isAuthorized, ...options })?.data || {};

	const nftNotifications = useMemo(
		() => userNotifications?.filter((n) => n.type === NotificationType.NewNft),
		[userNotifications]
	);

	return nftNotifications;
};
