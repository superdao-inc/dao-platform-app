import { createContext, PropsWithChildren, useContext } from 'react';
import noop from 'lodash/noop';

type CheckoutCommonContextValue = {
	email: string;
	setEmail(email: string): void;
};

const CheckoutCommonContext = createContext<CheckoutCommonContextValue>({ email: '', setEmail: noop });

export const CheckoutCommonProvider = ({ children, ...rest }: PropsWithChildren<CheckoutCommonContextValue>) => {
	return <CheckoutCommonContext.Provider value={rest}>{children}</CheckoutCommonContext.Provider>;
};

export const useCheckoutCommonContext = () => {
	const context = useContext(CheckoutCommonContext);

	if (!context) throw new Error('"CheckoutCommonContext" can not be used outside "CheckoutCommonProvider"');

	return context;
};
