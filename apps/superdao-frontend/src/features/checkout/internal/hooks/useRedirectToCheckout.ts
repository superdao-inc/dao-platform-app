import { useRouter } from 'next/router';
import { CheckoutNavigation } from 'src/features/checkout/internal/navigation';

export const useRedirectToCheckout = (slug: string, tier: string) => {
	const { push } = useRouter();

	// we don't use context here, so we can call this hook outside of checkout pages
	const navigation = new CheckoutNavigation(slug, tier, push);

	return () => navigation.toNftCheckout();
};
