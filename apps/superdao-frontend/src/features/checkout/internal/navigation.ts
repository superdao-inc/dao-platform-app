import { Router } from 'next/router';

export class CheckoutNavigationPaths {
	readonly daoProfile: string;
	readonly nftDetails: string;
	private readonly checkout: string;

	constructor(slug: string, tier: string) {
		const encodedSlug = encodeURIComponent(slug);
		const encodedTier = encodeURIComponent(tier);

		this.daoProfile = `/${encodedSlug}`;
		this.nftDetails = `${this.daoProfile}/${encodedTier}`;
		this.checkout = `${this.nftDetails}/checkout`;
	}

	get nftCheckout() {
		return `${this.checkout}/nft-checkout`;
	}

	get paymentSelection() {
		return `${this.checkout}/payment-selection`;
	}

	get finish() {
		return `${this.checkout}/finish`;
	}

	get success() {
		return `${this.checkout}/success`;
	}
}

export class CheckoutNavigation {
	readonly paths: CheckoutNavigationPaths;
	private readonly push: Router['push'];

	constructor(slug: string, tier: string, push: Router['push']) {
		this.paths = new CheckoutNavigationPaths(slug, tier);
		this.push = push;
	}

	toDaoProfile() {
		return this.push(this.paths.daoProfile);
	}

	toNftDetails() {
		return this.push(this.paths.nftDetails);
	}

	toNftCheckout() {
		return this.push(this.paths.nftCheckout);
	}

	toPaymentSelection() {
		return this.push(this.paths.paymentSelection);
	}

	toFinish({ tokenId = 0, chain }: { tokenId?: number; chain: number }) {
		return this.push({ pathname: this.paths.finish, query: { tokenId, chain } }, undefined, { shallow: true });
	}

	toSuccess() {
		return this.push(this.paths.success);
	}
}
