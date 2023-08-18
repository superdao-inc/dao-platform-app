import { useCheckNftAvailabilityQuery } from 'src/gql/nft.generated';

import { withRedirect } from '../helpers';
import { IBaseValidation } from '../namespace';
import { NotAvailableNftModal } from '../modals';
import { useIsAuthorized } from 'src/features/auth/hooks';
import { useCheckoutDataContext } from '../context/checkoutDataContext';
import { useCheckoutNavigationContext } from 'src/features/checkout/internal/context/checkoutNavigationContext';

export const useNftAvailabilityCheck = (): IBaseValidation & { isLoading: boolean } => {
	const { tier, kernelAddress } = useCheckoutDataContext();
	const { navigation } = useCheckoutNavigationContext();
	const isAuthorized = useIsAuthorized();

	const { isLoading, data, error } = useCheckNftAvailabilityQuery(
		{
			daoAddress: kernelAddress,
			tier
		},
		{
			enabled: !!kernelAddress && !!tier && isAuthorized,
			onError: (error) => {}
		}
	);

	const toDaoProfile = () => navigation.toDaoProfile();

	if (isLoading || error) {
		return {
			isLoading,
			isValid: false,
			ErrorModal: withRedirect(NotAvailableNftModal, toDaoProfile)
		};
	}

	const isValid = Boolean(data?.checkNftAvailability.isAvailable);

	return { isLoading, isValid, ErrorModal: withRedirect(NotAvailableNftModal, toDaoProfile) };
};
