import { useMutation, useQueryClient } from 'react-query';
import { OAuthProvider, OAuthRedirectResult } from '@magic-ext/oauth';

import { useTranslation } from 'next-i18next';

import { useWallet } from 'src/providers/walletProvider';
import { magicLink } from 'src/libs/magicLink';
import { gqlClient } from 'src/client/gqlApi';
import {
	AuthMagicLinkNonceDocument,
	AuthMagicLinkNonceMutation,
	AuthMagicLinkNonceMutationVariables,
	AuthSignatureDocument,
	AuthSignatureMutation,
	AuthSignatureMutationVariables,
	ValidateMagicEmailAndAddressDocument,
	ValidateMagicEmailAndAddressMutation,
	ValidateMagicEmailAndAddressMutationVariables
} from 'src/gql/auth.generated';
import { MagicLinkNonceDto, UserWalletType } from 'src/types/types.generated';
import { CurrentUserQuery } from 'src/gql/user.generated';
import { useCurrentUserQuery } from 'src/features/user/hooks/useCurrentUserQuery';

import { handleAuthError } from 'src/features/auth/hooks/common';
import { parseGqlErrorMessage } from 'src/utils/errors';
import { getSocialLink } from 'src/features/auth/utils/socialLink';
import { useRouter } from 'next/router';

const getScope = (social: OAuthProvider): string[] => {
	switch (social) {
		case 'discord':
			return ['email'];
		case 'facebook':
			return ['email', 'user_link'];
		case 'twitter':
			return ['email'];
		default:
			return ['email'];
	}
};

export const useMagicLinkSocialAuth = () => {
	const { connectTo } = useWallet();
	const { query, asPath } = useRouter();

	return useMutation(async (social: OAuthProvider) => {
		const provider = await connectTo('magiclink');
		if (!magicLink || !provider || typeof window === 'undefined') return;

		const scope = getScope(social);
		const to = Object.keys(query).length ? `?to=${asPath}` : '';

		await magicLink?.oauth.loginWithRedirect({
			provider: social,
			redirectURI: `${window.location.origin}/auth/magiclink${to}`,
			scope
		});
	});
};

const isMagicEmail = (_value: string | null): _value is string => {
	return typeof _value === 'string';
};

const isSocialAuth = (provider: OAuthProvider): provider is 'twitter' | 'discord' | 'facebook' => {
	return provider === 'twitter' || provider === 'discord' || provider === 'facebook';
};

export const useSocialAuth = () => {
	const { t } = useTranslation();
	const { connectTo, clear, onMagicLinkAuthorised } = useWallet();
	const queryClient = useQueryClient();

	return useMutation(
		async (result: OAuthRedirectResult) => {
			const provider = await connectTo('magiclink');
			if (!magicLink || !provider) return;

			const signer = provider.getSigner();
			const walletAddress = await signer.getAddress();
			const email = result.magic.userMetadata.email;

			if (isMagicEmail(email)) {
				const emailValidation = await gqlClient<
					ValidateMagicEmailAndAddressMutation,
					ValidateMagicEmailAndAddressMutationVariables
				>({
					query: ValidateMagicEmailAndAddressDocument,
					variables: { email, walletAddress }
				});

				if (!emailValidation?.validateMagicEmailAndAddress && result.oauth.provider === 'google')
					throw new Error(t('pages.login.useMetamask'));
			}

			const magicLinkNonceData: MagicLinkNonceDto = {
				walletAddress,
				email: email ?? ''
			};
			if (isSocialAuth(result.oauth.provider)) {
				magicLinkNonceData[result.oauth.provider] = getSocialLink(result.oauth.provider, result.oauth.userInfo);
			}

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
