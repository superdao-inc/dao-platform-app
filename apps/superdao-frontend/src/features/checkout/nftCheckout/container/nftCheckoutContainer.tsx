import { useTranslation } from 'next-i18next';

import { useNftAvailabilityCheck } from '../../internal/hooks/useNftAvailabilityCheck';
import { NFTCheckout } from '../components/nftCheckout';

import { PageContent, PageLoader, Title1 } from 'src/components';
import { CustomHead } from 'src/components/head';
import { MobileHeader } from 'src/components/mobileHeader';
import { useCheckoutNavigationContext } from '../../internal/context/checkoutNavigationContext';

export const NftCheckoutContainer = () => {
	const { t } = useTranslation();

	const { navigation } = useCheckoutNavigationContext();

	const { isLoading: isNftAvailabilityCheckLoading } = useNftAvailabilityCheck();

	const toNftDetails = () => navigation.toNftDetails();

	return (
		<PageContent columnSize="sm" onBack={toNftDetails}>
			<CustomHead main="NFT checkout" additional="Superdao" description="NFT checkout" />

			<Title1 className="mb-6 hidden lg:block">{t('pages.checkout.nftCheckout.heading')}</Title1>
			<MobileHeader title={t('pages.checkout.nftCheckout.heading')} onBack={toNftDetails} />

			{isNftAvailabilityCheckLoading ? <PageLoader /> : <NFTCheckout />}
		</PageContent>
	);
};
