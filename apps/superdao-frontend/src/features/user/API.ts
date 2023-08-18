import {
	useCurrentUserQuery,
	useUserDaoParticipationQuery,
	useCanCreateMoreDaoQuery,
	useCurrentUserMemberRoleQuery,
	useUserAsMemberQuery,
	useUpdateUserMutation,
	useUserByIdOrSlugQuery,
	useCurrentUserNotificationsQuery,
	useUserNftsQuery,
	useJoinBetaMutation,
	useIsCurrentUser,
	useCurrentUserNewNftsNotifications
} from './hooks';

export const UserAPI = {
	useCurrentUserQuery,
	useCurrentUserMemberRoleQuery,
	useCurrentUserNotificationsQuery,
	useUpdateUserMutation,
	useJoinBetaMutation,

	useUserDaoParticipationQuery,
	useCanCreateMoreDaoQuery,
	useUserAsMemberQuery,
	useUserByIdOrSlugQuery,
	useUserNftsQuery,
	useIsCurrentUser,
	useNotifications: useCurrentUserNewNftsNotifications
};
