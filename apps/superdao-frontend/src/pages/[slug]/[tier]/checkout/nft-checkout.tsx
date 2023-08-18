import { useTranslation } from 'next-i18next';

import { prefetchData, SSR } from 'src/client/ssr';
import { CheckoutFeatureContextProvider } from 'src/features/checkout/internal/components/featureProvider';
import { CheckoutCommonFetchingContainer } from 'src/features/checkout/internal/containers/checkoutCommonFetchingContainer';
import { NftCheckoutContainer } from 'src/features/checkout/nftCheckout';
import { CheckoutCommonValidatingContainer } from 'src/features/checkout/internal/containers/checkoutCommonValidatingContainer';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { CheckoutPageLoader } from 'src/features/checkout/internal/components/checkoutPageLoader';

const NFTCheckoutPaymentPage: NextPageWithLayout = (props) => {
	const { t } = useTranslation();
	const title = t('pages.checkout.nftCheckout.heading');
	const metaTitle = t('pages.checkout.nftCheckout.metaTitle');
	const metaDescription = t('pages.checkout.nftCheckout.metaDescription');

	return (
		<CheckoutFeatureContextProvider {...props}>
			<CheckoutCommonFetchingContainer
				pageLoaderComponent={
					<CheckoutPageLoader metaTitle={metaTitle} metaDescription={metaDescription} title={title} />
				}
			>
				<CheckoutCommonValidatingContainer shouldCheckAuthorisation={false}>
					<NftCheckoutContainer />
				</CheckoutCommonValidatingContainer>
			</CheckoutCommonFetchingContainer>
		</CheckoutFeatureContextProvider>
	);
};

NFTCheckoutPaymentPage.getLayout = getDaoLayout;

export const getServerSideProps = SSR(async (ctx) => {
	const [_, getProps] = await prefetchData(ctx);

	return { props: getProps() };
});

export default NFTCheckoutPaymentPage;
