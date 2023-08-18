import { createContext, FC, PropsWithChildren, useContext } from 'react';
import { ContractErrorModalArgs } from '../containers/checkoutCommonPaymentContainer';

type CheckoutPaymentContextData = {
	needsLeaveConfirm: boolean;
	setNeedsLeaveConfirm(arg: boolean): void;

	contractErrorModalArgs: ContractErrorModalArgs;
	setContractErrorModalArgs(args: ContractErrorModalArgs): void;
};

const CheckoutPaymentContext = createContext<CheckoutPaymentContextData>({
	needsLeaveConfirm: false,
	setNeedsLeaveConfirm() {},
	setContractErrorModalArgs() {},
	contractErrorModalArgs: {
		redirectPath: '',
		body: '',
		isOpen: false
	}
});

export const CheckoutPaymentContextProvider: FC<PropsWithChildren<CheckoutPaymentContextData>> = (props) => {
	const { children, ...value } = props;

	return <CheckoutPaymentContext.Provider value={value}>{children}</CheckoutPaymentContext.Provider>;
};

export const useCheckoutPaymentContext = () => {
	const context = useContext(CheckoutPaymentContext);

	if (!context)
		throw new Error('`useCheckoutPaymentContext` can not be used outside `CheckoutPaymentContext.Provider`');

	return context;
};
