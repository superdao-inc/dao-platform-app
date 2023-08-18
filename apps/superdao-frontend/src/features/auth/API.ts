import {
	useAuthWithWallet,
	useMagicLinkEmailAuth,
	useMagicLinkSocialAuth,
	useIsAuthorized,
	useAuthNonceMutation,
	useAuthSignatureMutation,
	useLogout,
	useMetamaskAccountChange
} from './hooks';

export const AuthAPI = {
	useAuthWithWallet,
	useMagicLinkEmailAuth,
	useMagicLinkSocialAuth,
	useIsAuthorized,
	useAuthNonceMutation,
	useAuthSignatureMutation,
	useLogout,
	useChangeAccount: useMetamaskAccountChange
};
