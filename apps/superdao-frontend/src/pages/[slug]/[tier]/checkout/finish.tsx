import { useTranslation } from 'next-i18next';

import { FEATURES } from '@sd/superdao-shared';

import { prefetchData, SSR } from 'src/client/ssr';
import { FinishContainer } from 'src/features/checkout/finish';
import { getIsFeatureEnabled } from 'src/server/featureToggles.service';
import { CheckoutFeatureContextProvider } from 'src/features/checkout/internal/components/featureProvider';
import { CheckoutCommonFetchingContainer } from 'src/features/checkout/internal/containers/checkoutCommonFetchingContainer';
import { CheckoutCommonValidatingContainer } from 'src/features/checkout/internal/containers/checkoutCommonValidatingContainer';
import { getDaoLayout, NextPageWithLayout } from 'src/layouts';
import { CheckoutPageLoader } from 'src/features/checkout/internal/components/checkoutPageLoader';
import { CheckoutCommonPaymentContainer } from 'src/features/checkout/internal/containers/checkoutCommonPaymentContainer';

type Props = {
	isWhitelistEnabled: boolean;
	isViaEnabled: boolean;
};

const FinishPage: NextPageWithLayout<Props> = (props) => {
	const { t } = useTranslation();
	const title = t('pages.checkout.finish.heading');
	const metaTitle = t('pages.checkout.finish.metaTitle');

	return (
		<CheckoutFeatureContextProvider {...props}>
			<CheckoutCommonFetchingContainer pageLoaderComponent={<CheckoutPageLoader metaTitle={metaTitle} title={title} />}>
				<CheckoutCommonValidatingContainer>
					<CheckoutCommonPaymentContainer>
						<FinishContainer />
					</CheckoutCommonPaymentContainer>
				</CheckoutCommonValidatingContainer>
			</CheckoutCommonFetchingContainer>
		</CheckoutFeatureContextProvider>
	);
};

FinishPage.getLayout = getDaoLayout;

export const getServerSideProps = SSR(async (ctx) => {
	const [_, getProps] = await prefetchData(ctx);

	const isViaEnabled = getIsFeatureEnabled(FEATURES.PAYMENT_WITH_VIA, ctx);

	return { props: { ...getProps(), isViaEnabled } };
});

export default FinishPage;
