import { useTranslation } from 'next-i18next';
import { useMutation, useQueryClient } from 'react-query';

import { useWallet } from 'src/providers/walletProvider';
import {
	AuthMagicLinkNonceDocument,
	AuthMagicLinkNonceMutation,
	AuthMagicLinkNonceMutationVariables,
	AuthSignatureDocument,
	AuthSignatureMutation,
	AuthSignatureMutationVariables,
	ValidateMagicEmailDocument,
	ValidateMagicEmailMutation,
	ValidateMagicEmailMutationVariables,
	ValidateMagicLinkTokenDocument,
	ValidateMagicLinkTokenMutation,
	ValidateMagicLinkTokenMutationVariables
} from 'src/gql/auth.generated';
import { CurrentUserQuery } from 'src/gql/user.generated';
import { gqlClient } from 'src/client/gqlApi';
import { useCurrentUserQuery } from 'src/features/user/hooks/useCurrentUserQuery';

// Error handling
import { parseGqlErrorMessage } from 'src/utils/errors';
import { handleAuthError } from 'src/features/auth/hooks/common';

// Magic Link
import { magicLink } from 'src/libs/magicLink';
import { UserWalletType } from 'src/types/types.generated';

export const useMagicLinkEmailAuth = (emailSentCallback: () => void) => {
	const queryClient = useQueryClient();

	const { t } = useTranslation();
	const { connectTo, clear, onMagicLinkAuthorised } = useWallet();

	return useMutation(
		async (email: string) => {
			const provider = await connectTo('magiclink');
			if (!magicLink || !provider) return;

			const emailValidation = await gqlClient<ValidateMagicEmailMutation, ValidateMagicEmailMutationVariables>({
				query: ValidateMagicEmailDocument,
				variables: { email }
			});
			if (!emailValidation?.validateMagicEmail) throw new Error(t('pages.login.useMetamask'));

			emailSentCallback();
			const didToken = await magicLink?.auth.loginWithEmailOTP({ email });

			// Magic DID-token validation
			const tokenValidation = await gqlClient<ValidateMagicLinkTokenMutation, ValidateMagicLinkTokenMutationVariables>({
				query: ValidateMagicLinkTokenDocument,
				variables: { didToken: didToken || '' }
			});
			if (!tokenValidation?.validateMagicLinkToken) throw new Error('Invalid token');

			const signer = provider.getSigner();
			const walletAddress = await signer.getAddress();

			// Get nonce from backend
			const magicLinkNonceData = { walletAddress, email };

			const authNonceResponse = await gqlClient<AuthMagicLinkNonceMutation, AuthMagicLinkNonceMutationVariables>({
				query: AuthMagicLinkNonceDocument,
				variables: { magicLinkNonceData }
			});

			const { authMagicLinkNonce } = authNonceResponse || {};
			if (!authMagicLinkNonce) throw new Error('nonce failed');

			// validate nonce and sign
			const signature = await signer.signMessage(authMagicLinkNonce);
			const signatureData = {
				walletAddress,
				nonce: authMagicLinkNonce,
				signature,
				walletType: UserWalletType.MagicLink
			};
			const authSignatureResponse = await gqlClient<AuthSignatureMutation, AuthSignatureMutationVariables>({
				query: AuthSignatureDocument,
				variables: { signatureData }
			});
			const { authSignature } = authSignatureResponse || {};

			return authSignature;
		},
		{
			onSuccess: (result) => {
				queryClient.invalidateQueries('daoBySlugWithRoles');
				queryClient.setQueryData<CurrentUserQuery>(useCurrentUserQuery.getKey(), {
					currentUser: result!
				});

				onMagicLinkAuthorised();
			},

			onError: async (error: any) => {
				handleAuthError(error, parseGqlErrorMessage(error), t('pages.login.error'));

				const isLoggedInMagic = await magicLink?.user.isLoggedIn();
				if (isLoggedInMagic) await magicLink?.user.logout();

				clear();
			}
		}
	);
};
