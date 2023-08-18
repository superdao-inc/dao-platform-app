import { useCallback, useEffect, useMemo } from 'react';
import {
	BuyNftMulticurrencyOpenSaleTxMutation,
	useBuyNftMulticurrencyOpenSaleTxMutation
} from 'src/gql/transaction.generated';
import { CustomError } from 'src/features/checkout/internal/namespace';
import { useBuyNftOpenSaleMutation } from 'src/gql/nft.generated';
import { useWallet } from 'src/providers/walletProvider';
import { socketConnection } from 'src/components/socketProvider';
import { MessageName } from '@sd/superdao-shared/';
import { UseBuyNftArgs } from 'src/features/checkout/internal/hooks/nftPurchase/types';

export const useBuyNft = (args: UseBuyNftArgs) => {
	const { email, tier, tokenAddress, kernelAddress, onBuyNftSuccess, onError } = args;

	const { sendTransaction } = useWallet();

	const { mutate: getBuyNftTx } = useBuyNftMulticurrencyOpenSaleTxMutation<CustomError>();
	const { mutate: processBuyNftTx } = useBuyNftOpenSaleMutation<CustomError>();

	const handleGetBuyNftTxSuccess = useCallback(
		async (args: BuyNftMulticurrencyOpenSaleTxMutation) => {
			try {
				const { buyNftMulticurrencyOpenSaleTx: transaction } = args;

				const txResponse = await sendTransaction(transaction);
				if (!txResponse) {
					throw new Error('handleGetBuyNftTxSuccess: getting txResponse failed');
				}

				processBuyNftTx(
					{
						buyNftData: {
							email,
							daoAddress: kernelAddress,
							tier,
							transactionHash: txResponse.hash
						}
					},
					{
						onError
					}
				);
			} catch (e) {
				onError(e as CustomError);
			}
		},
		[sendTransaction, processBuyNftTx, email, kernelAddress, tier, onError]
	);

	const buyNft = useCallback(() => {
		getBuyNftTx(
			{
				tier,
				tokenAddress,
				daoAddress: kernelAddress
			},
			{
				onSuccess: handleGetBuyNftTxSuccess,
				onError
			}
		);
	}, [getBuyNftTx, tier, tokenAddress, kernelAddress, handleGetBuyNftTxSuccess, onError]);

	useEffect(() => {
		socketConnection?.on(MessageName.BUY_NFT_SUCCESS, onBuyNftSuccess);
		socketConnection?.on(MessageName.BUY_NFT_FAIL, () => onError(new Error('Failed to buy nft')));

		return () => {
			socketConnection?.off(MessageName.BUY_NFT_SUCCESS);
			socketConnection?.off(MessageName.BUY_NFT_FAIL);
		};
	}, [onBuyNftSuccess, onError]);

	// Is used for memoization. Returning an array straightly will lead to recreating of this array (getting a new one) during each render.
	const functions = useMemo(() => {
		return { buyNft, handleGetBuyNftTxSuccess };
	}, [buyNft, handleGetBuyNftTxSuccess]);

	return functions;
};
