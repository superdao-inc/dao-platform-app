import { useTranslation } from 'next-i18next';
import { useMutation } from 'react-query';

import { Web3Provider } from '@ethersproject/providers';
import { useAuthNonceMutation } from 'src/gql/auth.generated';
import { useAuthSignatureMutation } from 'src/gql/auth.generated';

import { toast } from 'src/components/toast/toast';
import { loginMessageKey } from 'src/utils/toastKeys';
import { UserWalletType } from 'src/types/types.generated';

export const useMetamaskAccountChange = (provider?: Web3Provider) => {
	const { t } = useTranslation();

	return useMutation(
		async (walletAddress: string) => {
			const { ethereum } = window;
			if (!ethereum) {
				throw new Error(t('pages.login.noMetamask'));
			}

			if (!provider) throw new Error('Can not get provider');

			const signer = provider.getSigner();

			// get nonce from backend
			const nonceData = { walletAddress };
			const { authNonce } = (await useAuthNonceMutation.fetcher({ nonceData })()) || {};

			if (!authNonce) throw new Error('nonce failed');

			toast.loading(t('pages.login.signingToast'), {
				position: 'bottom-center',
				id: loginMessageKey
			});

			// FIXME: iOS wallets break for some reason if you ask them to sign something right after connecting.
			// Experimentally found out that it is enough to wait 1 second and the modal with the signature appears regularly.
			await new Promise((resolve) => {
				setTimeout(resolve, 1000);
			});

			// validate nonce and sign
			const signature = await signer.signMessage(authNonce);
			const signatureData = { walletAddress, nonce: authNonce, signature, walletType: UserWalletType.Metamask };

			const result = await useAuthSignatureMutation.fetcher({ signatureData })();
			return result?.authSignature;
		},
		{
			onSuccess: (result) => {
				toast.dismiss(loginMessageKey);
				toast.success(`Account changed to ${result?.walletAddress}`, { position: 'bottom-center', duration: 3000 });

				/**
				 * Работает лучше (красивее), чем location, но остается проблема не вызова SSR
				 */
				// router.replace(router.asPath);

				// eslint-disable-next-line no-restricted-globals
				location.reload();
			},
			onError: async (error: any) => {
				const message = error?.message;
			}
		}
	);
};
