import React, { FC, useEffect } from 'react';

import { AuthAPI } from 'src/features/auth/API';

import { withRedirect } from 'src/features/checkout/internal/helpers';
import { SaleIsNotActiveModal } from 'src/features/checkout/internal/modals';
import { useCheckoutNavigationContext } from 'src/features/checkout/internal/context/checkoutNavigationContext';
import { useCheckoutDataContext } from 'src/features/checkout/internal/context/checkoutDataContext';
import { AuthUI } from 'src/features/auth';

type Props = {
	shouldCheckAuthorisation?: boolean;
	children?: React.ReactNode;
};

export const CheckoutCommonValidatingContainer: FC<Props> = (props) => {
	const { shouldCheckAuthorisation = true, children } = props;
	const { navigation } = useCheckoutNavigationContext();
	const { isSaleActive } = useCheckoutDataContext();

	const { openAuthModal } = AuthUI.useAuthModal();
	const isAuthorized = AuthAPI.useIsAuthorized();

	const shouldShowAuthModal = isSaleActive && shouldCheckAuthorisation && !isAuthorized;

	// Check authorization
	useEffect(() => {
		if (shouldShowAuthModal) openAuthModal({ onClose: null });
	}, [openAuthModal, shouldShowAuthModal]);

	// Template

	if (shouldShowAuthModal) return null;

	if (!isSaleActive) {
		const ValidationErrorModal = withRedirect(SaleIsNotActiveModal, () => navigation.toDaoProfile());
		return <ValidationErrorModal />;
	}

	return <>{children}</>;
};
