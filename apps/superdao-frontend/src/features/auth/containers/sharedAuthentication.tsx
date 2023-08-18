import { useCallback, useState } from 'react';
import { OAuthProvider } from '@magic-ext/oauth';

import { useAuthWithWallet } from 'src/features/auth/hooks/useAuthWithWallet';
import { useMagicLinkEmailAuth } from 'src/features/auth/hooks/useMagicLinkEmailAuth';
import { useMagicLinkSocialAuth } from 'src/features/auth/hooks/useMagicLinkSocialAuth';

import { WalletType } from 'src/types/wallet';
import { AuthenticationOptions } from './authenticationOptions';
import { EmailWaiting } from '../components/emailWaiting';

type Props = {
	onSuccess?: () => any;
};

type Step = 'initial' | 'emailSent';

export const SharedAuthentication = ({ onSuccess }: Props) => {
	const [step, setStep] = useState<Step>('initial');
	const [email, setEmail] = useState('');

	const handleEmailSent = useCallback(() => {
		setStep('emailSent');
	}, []);

	const { mutate: authWithWallet, isLoading: isAuthWithWalletLoadign } = useAuthWithWallet();
	const { mutate: authMagicLinkEmail, isLoading: isMagicLinkEmailLoading } = useMagicLinkEmailAuth(handleEmailSent);
	const { mutate: authWithMagicSocial, isLoading: isMagicLinkSocialLoading } = useMagicLinkSocialAuth();

	const isLoading = isAuthWithWalletLoadign || isMagicLinkEmailLoading || isMagicLinkSocialLoading;

	const handleAuthWithWallet = (walletType: WalletType) => () => {
		authWithWallet(walletType, { onSuccess });
	};

	const handleAuthMagicSocial = (social: OAuthProvider) => {
		authWithMagicSocial(social);
	};

	const handleAuthWithMagicLink = useCallback(() => {
		authMagicLinkEmail(email, { onSuccess, onError: () => setStep('initial') });
	}, [authMagicLinkEmail, email, onSuccess]);

	switch (step) {
		case 'initial':
			return (
				<AuthenticationOptions
					onAuthWithWallet={handleAuthWithWallet}
					onAuthMagicLink={handleAuthWithMagicLink}
					onAuthMagicSocial={handleAuthMagicSocial}
					isLoading={isLoading}
					email={email}
					onEmailChange={setEmail}
				/>
			);

		case 'emailSent':
			return <EmailWaiting email={email} />;
		default:
			return null;
	}
};
