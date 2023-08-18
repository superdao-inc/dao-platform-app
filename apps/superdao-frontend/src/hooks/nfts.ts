import { useMutation } from 'react-query';

import { useTranslation } from 'next-i18next';
import {
	BuyWhitelistNftTxDocument,
	BuyWhitelistNftTxQuery,
	BuyWhitelistNftTxQueryVariables,
	DeleteNftTierTxQueryVariables,
	useDeleteNftTierTxQuery
} from 'src/gql/transaction.generated';
import { useCheckoutCommonContext } from 'src/features/checkout/internal/context/checkoutCommonContext';
import { useBuyNftWhitelistSaleMutation } from 'src/gql/nft.generated';
import { useWallet } from 'src/providers/walletProvider';
import { buyWhitelistNftKey } from 'src/utils/toastKeys';
import { toast } from 'src/components/toast/toast';
import { MetamaskError } from 'src/types/metamask';
import { gqlClient } from 'src/client/gqlApi';

import { CurrentUserQuery } from 'src/gql/user.generated';

export const useBuyWhitelistNft = ({ currentUser }: { currentUser?: CurrentUserQuery['currentUser'] }) => {
	const { t } = useTranslation();
	const { sendTransaction } = useWallet();
	const { email: contextEmail } = useCheckoutCommonContext();
	const email = currentUser?.email ?? contextEmail;

	return useMutation<unknown, Error, BuyWhitelistNftTxQueryVariables>(
		async ({ daoAddress, toAddress, tier }: BuyWhitelistNftTxQueryVariables) => {
			const toastId = buyWhitelistNftKey(daoAddress, tier);
			toast.loading(t('toasts.buyNft.loading'), {
				position: 'bottom-center',
				id: toastId
			});

			try {
				const data = await gqlClient<BuyWhitelistNftTxQuery, BuyWhitelistNftTxQueryVariables>({
					query: BuyWhitelistNftTxDocument,
					variables: {
						daoAddress,
						tier,
						toAddress
					}
				});
				const { buyNftWhitelistSaleTx } = data || {};

				if (!buyNftWhitelistSaleTx) {
					throw new Error('');
				}

				const txResponse = await sendTransaction(buyNftWhitelistSaleTx);

				if (!txResponse) {
					throw new Error('');
				}

				const { hash } = txResponse;

				await useBuyNftWhitelistSaleMutation.fetcher({
					buyNftData: { email, daoAddress, tier, transactionHash: hash }
				})();
			} catch (e: any) {
				toast.dismiss(toastId);

				let typeErrorText = t('toasts.buyNft.fail');
				if (
					e?.message?.includes('insufficient funds') ||
					(e as unknown as MetamaskError).data?.message.includes('insufficient funds')
				) {
					typeErrorText = t('toasts.buyNft.insufficientFunds');
				}

				const maybeMetamaskError = e as unknown as MetamaskError;
				const metamaskErrorMessage = t(`errors.metamask.${maybeMetamaskError?.code}`, '');

				toast.error(metamaskErrorMessage || typeErrorText, {
					position: 'bottom-center',
					duration: 5000
				});

				await Promise.reject(e);
			}
		}
	);
};

export const useExecuteDeleteNftTier = () => {
	const { sendTransaction } = useWallet();

	return useMutation<unknown, Error, DeleteNftTierTxQueryVariables>(
		async ({ daoAddress, erc721CollectionAddress, tier }: DeleteNftTierTxQueryVariables) => {
			try {
				const { deleteNftTierTx } =
					(await useDeleteNftTierTxQuery.fetcher({
						daoAddress,
						erc721CollectionAddress,
						tier
					})()) || {};

				if (!deleteNftTierTx) {
					throw Error;
				}

				const txResponse = await sendTransaction(deleteNftTierTx);

				if (!txResponse) {
					throw Error;
				}

				return txResponse.wait(1);
			} catch (e) {
				return await Promise.reject(e);
			}
		}
	);
};
