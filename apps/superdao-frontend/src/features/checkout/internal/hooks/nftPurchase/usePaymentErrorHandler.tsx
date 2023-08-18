import { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { CustomError, isCustomError } from 'src/features/checkout/internal/namespace';

import { ContractErrorCode, MetamaskErrorCode } from 'src/constants/errorCodes';
import { toast } from 'src/components';
import { ContractErrorCodesToShowModalFor } from 'src/features/checkout/internal/constants';
import { useCheckoutNavigationContext } from 'src/features/checkout/internal/context/checkoutNavigationContext';
import { useCheckoutPaymentContext } from 'src/features/checkout/internal/context/checkoutPaymentContext';

const DEFAULT_ERROR_MESSAGE_KEY = 'errors.anErrorOccured';

/**
 * Error callbacks
 */
export const usePaymentErrorHandler = () => {
	const { t } = useTranslation();

	const { navigation } = useCheckoutNavigationContext();
	const { setContractErrorModalArgs, setNeedsLeaveConfirm } = useCheckoutPaymentContext();

	const errorHandler = useCallback(
		(error: unknown | CustomError) => {
			// Logging all errors

			// Try to parse common metamask errors
			if (isCustomError(error) && typeof error.code === 'number' && error.code in MetamaskErrorCode) {
				toast.error(t(`errors.metamask.${error.code}`));
				console.error(error);
				return;
			}

			const contractErrorCode = getContractErrorCode(error);

			if (contractErrorCode) {
				const shouldShowErrorModal = ContractErrorCodesToShowModalFor.includes(contractErrorCode);

				if (shouldShowErrorModal) {
					let redirectPath: string | undefined;

					switch (contractErrorCode) {
						case ContractErrorCode.INSUFFICIENT_AMOUNTS_OF_FUNDS:
						case ContractErrorCode.INSUFFICIENT_ALLOWANCE: {
							redirectPath = navigation.paths.paymentSelection;
							break;
						}
						case ContractErrorCode.UNAVAILABLE_ERROR:
						case ContractErrorCode.BUY_LIMIT_ERROR:
						default:
							redirectPath = navigation.paths.daoProfile;
					}

					// Modal will redirect user to different page, so "leave page?" confirmation should not be shown.
					setNeedsLeaveConfirm(false);
					setContractErrorModalArgs({
						redirectPath,
						body: t(`errors.contract.${contractErrorCode}`),
						isOpen: true
					});
				} else {
					toast.error(t(`errors.contract.${contractErrorCode}`));
				}

				return;
			}

			toast.error(t(DEFAULT_ERROR_MESSAGE_KEY, { sentryEventId: eventId }));
			console.error(error);
		},
		[navigation.paths.daoProfile, navigation.paths.paymentSelection, setContractErrorModalArgs, setNeedsLeaveConfirm, t]
	);

	return errorHandler;
};

const getContractErrorCode = (error: unknown): ContractErrorCode | undefined => {
	if (!isCustomError(error) || !error.data?.message) return;

	const { message } = error.data;

	const contractErrorCode = Object.entries(ContractErrorCode).find((contractError) => {
		const [, contractErrorCode] = contractError;
		return message.includes(contractErrorCode);
	})?.[1];

	return contractErrorCode;
};
