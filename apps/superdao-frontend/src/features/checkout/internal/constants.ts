import { ContractErrorCode } from 'src/constants/errorCodes';

export const MINIMUM_ETH_TRANSACTION_AMOUNT_IN_USD = 100;

/**
 * Contract errors, for which modal should be shown instead of the toast.
 */
export const ContractErrorCodesToShowModalFor = [
	ContractErrorCode.UNAVAILABLE_ERROR,
	ContractErrorCode.BUY_LIMIT_ERROR,
	ContractErrorCode.INSUFFICIENT_AMOUNTS_OF_FUNDS,
	ContractErrorCode.INSUFFICIENT_ALLOWANCE
];

// because we use only routes with 1 action in it, we can hardcode first action here
export const VIA_NUM_ACTION = 0;
