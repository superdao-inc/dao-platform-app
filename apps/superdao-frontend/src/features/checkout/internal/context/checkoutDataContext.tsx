import React, { createContext, useContext, FC } from 'react';
import { CollectionInfoByTierQuery } from 'src/gql/nft.generated';
import { DaoBySlugQuery } from 'src/gql/daos.generated';

type Value = {
	isSaleActive: boolean;
	tier: string;
	slug: string;
	kernelAddress: string;
	dao: NonNullable<DaoBySlugQuery['daoBySlug']>;
	tierInfo: CollectionInfoByTierQuery['collectionInfoByTier'];
};

const CheckoutDataContext = createContext<Value>({} as Value);

type Props = Value & {
	children?: React.ReactNode;
};

export const CheckoutDataContextProvider: FC<Props> = (props) => {
	const { children, ...value } = props;

	return <CheckoutDataContext.Provider value={value}>{children}</CheckoutDataContext.Provider>;
};

export const useCheckoutDataContext = () => {
	const context = useContext(CheckoutDataContext);

	if (!context) throw new Error('`useCheckoutDataContext` can not be used outside `CheckoutDataContext.Provider`');

	return context;
};
