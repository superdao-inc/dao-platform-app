import React, { createContext, useContext } from 'react';

type Value = {
	isFiatPaymentEnabled?: boolean;
	isViaEnabled?: boolean;
};

const ChekoutFeatureContext = createContext<Value>({});

type Props = Value & {
	children?: React.ReactNode;
};

export const CheckoutFeatureContextProvider: React.FC<Props> = (props) => {
	const { children, isFiatPaymentEnabled, isViaEnabled } = props;
	return (
		<ChekoutFeatureContext.Provider
			value={{
				isFiatPaymentEnabled,
				isViaEnabled
			}}
		>
			{children}
		</ChekoutFeatureContext.Provider>
	);
};

export const useCheckoutFeatureContext = () => {
	return useContext(ChekoutFeatureContext);
};
