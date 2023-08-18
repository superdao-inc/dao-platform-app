import {
	useUpdateUserEmailMutation,
	useRemoveUserEmailMutation,
	useSendEmailVerificationMessageMutation
} from 'src/gql/emailSettings.generated';

export const EmailSettingsAPI = {
	useUpdateUserEmailMutation,
	useRemoveUserEmailMutation,
	useSendEmailVerificationMessageMutation
};
