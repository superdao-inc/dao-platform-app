import { useCallback, useEffect } from 'react';
import {
	BuyNftAllowanceTxMutation,
	useBuyNftAllowanceTxMutation,
	useProcessAllowanceTxMutation
} from 'src/gql/transaction.generated';
import { CustomError } from 'src/features/checkout/internal/namespace';
import { useWallet } from 'src/providers/walletProvider';
import { socketConnection } from 'src/components/socketProvider';
import { MessageBody, MessageName } from '@sd/superdao-shared/';
import { useBuyNft } from './useBuyNft';
import { UseBuyNftArgs } from 'src/features/checkout/internal/hooks/nftPurchase/types';

export const useBuyNftWithAllowance = (args: UseBuyNftArgs) => {
	const { tier, tokenAddress, kernelAddress, onError } = args;

	const { sendTransaction } = useWallet();

	const { mutate: getAllowanceTx } = useBuyNftAllowanceTxMutation<CustomError>();
	const { mutate: processAllowanceTx } = useProcessAllowanceTxMutation<CustomError>();

	const { handleGetBuyNftTxSuccess } = useBuyNft(args);

	const handleGetAllowanceTxSuccess = useCallback(
		async (args: BuyNftAllowanceTxMutation) => {
			try {
				const { buyNftAllowanceTx: transaction } = args;

				const txResponse = await sendTransaction(transaction);

				/**
				 * Stop user flow on transaction failure
				 */
				if (!txResponse) {
					throw new Error('onGetAllowanceTxSuccess txResponse failed');
				}

				processAllowanceTx(
					{
						tier,
						tokenAddress,
						daoAddress: kernelAddress,
						transactionHash: txResponse.hash
					},
					{
						onError
					}
				);
			} catch (e) {
				onError(e as CustomError);
			}
		},
		[sendTransaction, processAllowanceTx, tier, tokenAddress, kernelAddress, onError]
	);

	const buyNftWithAllowance = useCallback(() => {
		getAllowanceTx(
			{
				tier,
				tokenAddress,
				daoAddress: kernelAddress
			},
			{
				onSuccess: handleGetAllowanceTxSuccess,
				onError
			}
		);
	}, [getAllowanceTx, tier, tokenAddress, kernelAddress, handleGetAllowanceTxSuccess, onError]);

	useEffect(() => {
		socketConnection?.on(
			MessageName.BUY_ALLOWANCE_SUCCESS,
			({ transaction }: MessageBody[MessageName.BUY_ALLOWANCE_SUCCESS]) => {
				void handleGetBuyNftTxSuccess({ buyNftMulticurrencyOpenSaleTx: transaction as any });
			}
		);
		socketConnection?.on(MessageName.BUY_ALLOWANCE_FAILED, () => onError(new Error('Failed to get allowance')));

		return () => {
			socketConnection?.off(MessageName.BUY_ALLOWANCE_SUCCESS);
			socketConnection?.off(MessageName.BUY_ALLOWANCE_FAILED);
		};
	}, [handleGetBuyNftTxSuccess, onError]);

	return buyNftWithAllowance;
};
