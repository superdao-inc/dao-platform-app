import { useEffect } from 'react';
import { formatTier, MATIC_TOKEN_ADDRESS } from '@sd/superdao-shared';
import { winterUrl } from 'src/constants';

type WinterCheckoutModalProps = {
	projectId: number;
	tierPreviewImage?: string;
	tierId: string;
	walletAddress?: string;
	email?: string | null;
	onClose: () => void;
	onPaymentSucceed: (transactionHash: string) => void;
};

export const WinterFiatCheckoutModal = (props: WinterCheckoutModalProps) => {
	const { projectId, tierPreviewImage, walletAddress, email, tierId, onClose, onPaymentSucceed } = props;

	useEffect(() => {
		const winterModalListener = (event: MessageEvent) => {
			const { origin, data } = event;

			/*
				Ignores any events that come not from the winter iframe.Protects code from security issues.
				Read about the security issues here https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#examples
			 */
			if (origin !== winterUrl) return;

			if (typeof data === 'string' && data === 'closeWinterCheckoutModal') {
				onClose();
			}

			if (typeof data === 'object' && data.name == 'successfulWinterCheckout') {
				onPaymentSucceed(event.data.transactionHash);
			}
		};

		window.addEventListener('message', winterModalListener);

		return () => {
			window.removeEventListener('message', winterModalListener);
		};
	}, [onClose, onPaymentSucceed]);

	const projectUrl = getWinterProjectUrl({
		baseURL: winterUrl,
		projectId,
		tierPreviewImage,
		walletAddress,
		email,
		tierId
	});

	return (
		<iframe
			className=" fixed top-0 bottom-0 right-0 z-[9999] m-0 h-full w-full	overflow-hidden border-none p-0"
			id="winter-checkout"
			src={projectUrl}
		/>
	);
};

type GetWinterProjectUrlParams = Pick<
	WinterCheckoutModalProps,
	'projectId' | 'tierPreviewImage' | 'walletAddress' | 'email' | 'tierId'
> & {
	baseURL: string;
};

const getWinterProjectUrl = (params: GetWinterProjectUrlParams) => {
	const { baseURL, projectId, tierPreviewImage, tierId, walletAddress, email } = params;

	let winterProjectURL = new URL(baseURL);
	const searchParams = winterProjectURL.searchParams;

	searchParams.set('projectId', projectId.toString());

	if (tierPreviewImage) searchParams.set('brandImage', tierPreviewImage);
	if (walletAddress) searchParams.set('walletAddress', walletAddress);
	if (email) searchParams.set('email', email);

	const tierValue = formatTier(tierId);

	/**
	 * extraMintParams are params except 'address', 'amount', and 'proof' that are passed to contract buy() function.
	 * Their names must be spelled the same as arguments of the contract buy() function.
	 *
	 * Contract function signature is:
	 *	buy(
	 *     address to,
	 *     bytes32 tierValue,
	 *     address tokenBuyAddress
	 * 	)
	 */
	const extraMintParams = JSON.stringify({ tierValue, tokenBuyAddress: MATIC_TOKEN_ADDRESS });
	searchParams.set('extraMintParams', extraMintParams); // maybe encodeURIComponent(extraMintParams))

	/**
	 * priceFunctionParams are params passed to method getPrice() of OpenSale contract.
	 * The contract getPrice() method real name is configured in winter dashboard.
	 */
	const priceFunctionParams = JSON.stringify({ tierValue });
	searchParams.set('priceFunctionParams', priceFunctionParams);

	return winterProjectURL.toString();
};
