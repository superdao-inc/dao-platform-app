import { withRedirect } from '../helpers';
import { TierIsNotValidModal } from '../modals';
import { IBaseValidation } from '../namespace';

import { useCheckoutDataContext } from '../context/checkoutDataContext';
import { useCheckoutNavigationContext } from 'src/features/checkout/internal/context/checkoutNavigationContext';

export const useTierQueryValidation = (): IBaseValidation => {
	const { tierInfo } = useCheckoutDataContext();
	const { navigation } = useCheckoutNavigationContext();

	return { isValid: !!tierInfo, ErrorModal: withRedirect(TierIsNotValidModal, () => navigation.toDaoProfile()) };
};
