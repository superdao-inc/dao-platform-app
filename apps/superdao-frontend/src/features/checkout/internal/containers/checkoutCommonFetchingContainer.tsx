import { useRouter } from 'next/router';
import { FC, useEffect, ReactNode } from 'react';
import { useTranslation } from 'next-i18next';

import { useDaoBySlugQuery, useIsOpenSaleActiveQuery } from 'src/gql/daos.generated';
import { useCollectionInfoByTierQuery } from 'src/gql/nft.generated';
import { getIsValueProvided } from 'src/utils/texts';
import { parseGqlErrorMessage } from 'src/utils/errors';

import { CheckoutDataContextProvider } from '../context/checkoutDataContext';
import { TierIsNotValidModal, UnknownErrorModal } from '../modals';
import { CheckoutNavigationContextProvider } from '../context/checkoutNavigationContext';

type Props = {
	pageLoaderComponent: ReactNode;
	children?: ReactNode;
};

export const CheckoutCommonFetchingContainer: FC<Props> = (props) => {
	const { children, pageLoaderComponent } = props;

	const { t } = useTranslation();
	const { query, push } = useRouter();
	const slug = typeof query.slug === 'string' ? query.slug : '';
	const tier = typeof query.tier === 'string' ? query.tier : '';

	const redirectToDao = () => push(`/${slug}`);

	useEffect(() => {
		if (!getIsValueProvided(tier)) {
			redirectToDao();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tier, slug, push]);

	const { data: daoData, isLoading: isDaoBySlugLoading } = useDaoBySlugQuery(
		{ slug },
		{
			onError: (error) => {}
		}
	);
	const dao = daoData?.daoBySlug;
	const { contractAddress: kernelAddress } = dao || {};

	const { data: collectionData, isLoading: isCollectionLoading } = useCollectionInfoByTierQuery(
		{
			daoAddress: kernelAddress as string,
			tier
		},
		{
			enabled: !!kernelAddress && getIsValueProvided(tier),
			onError: (error) => {}
		}
	);

	const { data: saleStatusData, isLoading: isSaleStatusLoading } = useIsOpenSaleActiveQuery(
		{
			daoAddress: kernelAddress as string
		},
		{
			enabled: !!kernelAddress,
			onError: (error) => {}
		}
	);

	const isLoading = isDaoBySlugLoading || isCollectionLoading || isSaleStatusLoading;

	if (isLoading) {
		return <>{pageLoaderComponent}</>;
	}

	if (!collectionData?.collectionInfoByTier) return <TierIsNotValidModal onRedirect={redirectToDao} />;

	if (!dao || !kernelAddress) return <UnknownErrorModal onRedirect={redirectToDao} />;

	return (
		<CheckoutDataContextProvider
			isSaleActive={!!saleStatusData?.isOpenSaleActive}
			slug={slug}
			tier={tier}
			tierInfo={collectionData.collectionInfoByTier}
			kernelAddress={kernelAddress}
			dao={dao}
		>
			<CheckoutNavigationContextProvider slug={slug} tier={tier}>
				{children}
			</CheckoutNavigationContextProvider>
		</CheckoutDataContextProvider>
	);
};
