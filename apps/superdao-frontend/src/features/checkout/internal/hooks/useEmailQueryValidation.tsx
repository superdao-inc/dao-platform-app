import { withRedirect } from '../helpers';
import { EmailIsNotValidModal } from '../modals';
import { IBaseValidation } from '../namespace';

import { isValidEmail } from '@sd/superdao-shared';
import { useCheckoutNavigationContext } from 'src/features/checkout/internal/context/checkoutNavigationContext';

export const useEmailQueryValidation = (email?: string | null): IBaseValidation | null => {
	const { navigation } = useCheckoutNavigationContext();

	return {
		isValid: isValidEmail(email),
		ErrorModal: withRedirect(EmailIsNotValidModal, () => navigation.toNftCheckout())
	};
};
