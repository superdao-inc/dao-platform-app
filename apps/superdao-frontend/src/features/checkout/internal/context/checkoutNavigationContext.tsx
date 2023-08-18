import React, { createContext, useContext, useMemo, FC } from 'react';
import { useRouter } from 'next/router';
import { CheckoutNavigation } from '../navigation';

type Value = { navigation: CheckoutNavigation };

const CheckoutNavigationContext = createContext<Value>({} as Value);

type Props = {
	slug: string;
	tier: string;
	children?: React.ReactNode;
};

export const CheckoutNavigationContextProvider: FC<Props> = (props) => {
	const { children, slug, tier } = props;
	const { push } = useRouter();

	const value: Value = useMemo(
		() => ({
			navigation: new CheckoutNavigation(slug, tier, push)
		}),
		[slug, tier, push]
	);

	return <CheckoutNavigationContext.Provider value={value}>{children}</CheckoutNavigationContext.Provider>;
};

export const useCheckoutNavigationContext = () => {
	const context = useContext(CheckoutNavigationContext);

	if (!context)
		throw new Error('`useCheckoutNavigationContext` can not be used outside `CheckoutNavigationContext.Provider`');

	return context;
};
