import { CustomError } from 'src/features/checkout/internal/namespace';

export type UseBuyNftArgs = {
	email?: string;
	tier: string;
	tokenAddress: string;
	kernelAddress: string;
	onBuyNftSuccess(): void;
	onError(e: CustomError): void;
};
