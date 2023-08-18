import { useTranslation } from 'next-i18next';

import { FEATURES } from '@sd/superdao-shared';

import { PaymentSelectionContainer } from 'src/features/checkout/paymentSelection';
import { prefetchData, SSR } from 'src/client/ssr';
import { featureToggles, getIsFeatureEnabled } from 'src/server/featureToggles.service';
import { CheckoutFeatureContextProvider } from 'src/features/checkout/internal/components/featureProvider';
import { CheckoutCommonFetchingContainer } from 'src/features/checkout/internal/containers/checkoutCommonFetchingContainer';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { CheckoutCommonValidatingContainer } from 'src/features/checkout/internal/containers/checkoutCommonValidatingContainer';
import { CheckoutPageLoader } from 'src/features/checkout/internal/components/checkoutPageLoader';
import { CheckoutCommonPaymentContainer } from 'src/features/checkout/internal/containers/checkoutCommonPaymentContainer';

type Props = {
	isFiatPaymentEnabled: boolean;
	isViaEnabled: boolean;
};

const CheckoutPaymentSelectionPage: NextPageWithLayout<Props> = (props) => {
	const { t } = useTranslation();
	const title = t('pages.checkout.choose.heading');
	const metaTitle = t('pages.checkout.choose.metaTitle');

	return (
		<CheckoutFeatureContextProvider {...props}>
			<CheckoutCommonFetchingContainer pageLoaderComponent={<CheckoutPageLoader metaTitle={metaTitle} title={title} />}>
				<CheckoutCommonValidatingContainer>
					<CheckoutCommonPaymentContainer>
						<PaymentSelectionContainer />
					</CheckoutCommonPaymentContainer>
				</CheckoutCommonValidatingContainer>
			</CheckoutCommonFetchingContainer>
		</CheckoutFeatureContextProvider>
	);
};

CheckoutPaymentSelectionPage.getLayout = getDaoLayout;

export const getServerSideProps = SSR(async (ctx) => {
	const [_, getProps] = await prefetchData(ctx);

	const isFiatPaymentEnabled = featureToggles.isEnabled('sale_fiat_payment');

	const isViaEnabled = getIsFeatureEnabled(FEATURES.PAYMENT_WITH_VIA, ctx);

	return {
		props: { ...getProps(), isFiatPaymentEnabled, isViaEnabled }
	};
});

export default CheckoutPaymentSelectionPage;
