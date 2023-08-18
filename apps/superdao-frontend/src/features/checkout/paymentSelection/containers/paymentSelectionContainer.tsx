import { useTranslation } from 'next-i18next';
import { useNftAvailabilityCheck } from '../../internal/hooks/useNftAvailabilityCheck';
import { TwoTabsLayout } from '../../internal/components';
import { useEmailQueryValidation } from '../../internal/hooks/useEmailQueryValidation';

import { useSwitch } from 'src/hooks';
import { PageLoader, toast } from 'src/components';
import { PaymentSelection } from 'src/features/checkout/paymentSelection/components/paymentSelection';
import { useGetFinalPrice } from 'src/features/checkout/internal/hooks/useGetFinalPrice';
import { CustomHead } from 'src/components/head';
import { UserAPI } from 'src/features/user';
import { useCheckoutDataContext } from '../../internal/context/checkoutDataContext';
import { useCheckoutCommonContext } from '../../internal/context/checkoutCommonContext';

export const PaymentSelectionContainer = () => {
	const { t } = useTranslation();
	const { tierInfo } = useCheckoutDataContext();
	const { email } = useCheckoutCommonContext();

	const [shouldShowNavigationTabs, { on: showNavigationTabs, off: hideNavigationTabs }] = useSwitch(true);

	const { data: currentUserData, isLoading: isUserDataLoading } = UserAPI.useCurrentUserQuery();
	const { currentUser } = currentUserData ?? {};

	const priceTokenSymbol = tierInfo.currency;
	const finalPrice = useGetFinalPrice(tierInfo.totalPrice?.openSale, priceTokenSymbol);

	const emailValidationResult = useEmailQueryValidation(currentUser?.email ?? email);

	const nftAvailabilityValidationResult = useNftAvailabilityCheck();
	const isNftAvailabilityCheckLoading = nftAvailabilityValidationResult?.isLoading;

	if (isNftAvailabilityCheckLoading || isUserDataLoading) {
		return (
			<TwoTabsLayout activeTabIndex={0}>
				<CustomHead main={'Payment selection'} additional={'Superdao'} description={'Payment selection'} />

				<PageLoader />
			</TwoTabsLayout>
		);
	}

	/**
	 * ORDER BELOW IS IMPORTANT
	 */

	if (nftAvailabilityValidationResult && !nftAvailabilityValidationResult.isValid) {
		const ValidationErrorModal = nftAvailabilityValidationResult.ErrorModal;
		return <ValidationErrorModal />;
	}

	if (emailValidationResult && !emailValidationResult.isValid) {
		const ValidationErrorModal = emailValidationResult.ErrorModal;
		return <ValidationErrorModal />;
	}

	if (!finalPrice || !priceTokenSymbol) {
		toast.error(t('errors.invalidPriceCalculation'), { id: 'toast_invalidPriceCalculation' });
		return null;
	}

	return (
		<TwoTabsLayout shouldShowTabs={shouldShowNavigationTabs} activeTabIndex={0}>
			<CustomHead main={'Payment selection'} additional={'Superdao'} description={'Payment selection'} />

			<PaymentSelection
				showNavigationTabs={showNavigationTabs}
				hideNavigationTabs={hideNavigationTabs}
				price={finalPrice}
				priceTokenSymbol={priceTokenSymbol}
			/>
		</TwoTabsLayout>
	);
};
