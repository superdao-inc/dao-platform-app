import { CheckoutNavigationPaths } from 'src/features/checkout/internal/navigation';

export const betaRequestRedirect = {
	redirect: { destination: '/beta/request', permanent: false }
};

export const daosRedirect = {
	redirect: { destination: '/daos', permanent: false }
};

export const getDaoCheckoutRedirect = (slug: string, tier: string) => {
	const checkoutPaths = new CheckoutNavigationPaths(slug, tier);

	return {
		redirect: { destination: checkoutPaths.nftCheckout, permanent: false }
	};
};

export const emailClaimRedirect = (slug: string, tier: string, claimId: string) => {
	const encodedClaimId = encodeURIComponent(claimId);

	return {
		redirect: { destination: `/${slug}/${tier}?claim=email&claimId=${encodedClaimId}`, permanent: false }
	};
};
