import { useCallback, useState, ChangeEvent, useRef, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { isValidEmail } from '@sd/superdao-shared';

import { Button, Input, toast } from 'src/components';
import { AuthUI, AuthAPI } from 'src/features/auth';
import { UserAPI } from 'src/features/user';
import { useCheckoutNavigationContext } from 'src/features/checkout/internal/context/checkoutNavigationContext';
import { useCheckoutCommonContext } from '../../internal/context/checkoutCommonContext';
import { SelectedNFT } from './selectedNft';

export const NFTCheckout = () => {
	const { t } = useTranslation();
	const { navigation } = useCheckoutNavigationContext();
	const { setEmail: setEmailToContext } = useCheckoutCommonContext();

	const { openAuthModal } = AuthUI.useAuthModal();
	const isAuthorized = AuthAPI.useIsAuthorized();

	const { data: userData, isLoading: isUserDataLoading } = UserAPI.useCurrentUserQuery();
	const { currentUser } = userData || {};

	const [email, setEmail] = useState<string>('');
	const emailInputRef = useRef<HTMLInputElement | null>(null);

	// Reset saved email
	useEffect(() => {
		setEmailToContext('');
	}, [setEmailToContext]);

	const continueToPaymentSelection = useCallback(() => {
		if (!currentUser) throw Error('User is not authorized');

		if (currentUser.email) return navigation.toPaymentSelection();

		if (email.length === 0) {
			emailInputRef.current?.focus();
			toast.error(t('pages.checkout.nftCheckout.email.error.fillEmail'), { id: 'fill_email' });
			return;
		}

		if (!isValidEmail(email)) {
			emailInputRef.current?.focus();
			toast.error(t('pages.checkout.nftCheckout.email.error.invalidEmail'), { id: 'invalid_email' });
			return;
		}

		setEmailToContext(email);
		void navigation.toPaymentSelection();
	}, [currentUser, navigation, email, setEmailToContext, t]);

	const handleEmailInputChanged = useCallback((e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), []);

	const authUser = useCallback((): void => openAuthModal(), [openAuthModal]);

	const handleButtonClick = isAuthorized ? continueToPaymentSelection : authUser;

	const showEmailInput = isAuthorized && !isUserDataLoading && !currentUser?.email;
	const buttonLabel = isAuthorized ? t('actions.labels.continue') : t('actions.labels.login');

	return (
		<div className="md:bg-backgroundSecondary mt-5 flex-col rounded-xl transition-all md:p-6 lg:mt-32">
			<SelectedNFT discount={0} />
			{showEmailInput && (
				<div className="mt-3">
					<Input
						ref={emailInputRef}
						name="email"
						label={t('pages.checkout.nftCheckout.email.header')}
						value={email}
						placeholder={t('pages.checkout.nftCheckout.email.placeholder')}
						autoComplete="on"
						onChange={handleEmailInputChanged}
					/>
				</div>
			)}
			<Button className="mt-5 w-full" label={buttonLabel} size="lg" color="accentPrimary" onClick={handleButtonClick} />
		</div>
	);
};
