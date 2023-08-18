import { useMutation } from 'react-query';

import { useWallet } from 'src/providers/walletProvider';
import {
	useWhitelistAddWalletMutation,
	useWhitelistRemoveWalletMutation,
	useUpdateWhitelistStatusMutation,
	UpdateWhitelistStatusMutationVariables
} from 'src/gql/whitelist.generated';
import {
	useWhitelistAddWalletsTxQuery,
	useWhitelistRemoveWalletsTxQuery,
	WhitelistAddWalletsTxQueryVariables
} from 'src/gql/transaction.generated';

export const useRemoveWhitelistWallet = () => {
	const { sendTransaction } = useWallet();
	return useMutation(async ({ daoAddress, userId }: any) => {
		try {
			const { whitelistRemoveWalletsTx } =
				(await useWhitelistRemoveWalletsTxQuery.fetcher({ userId, daoAddress })()) || {};
			if (!whitelistRemoveWalletsTx) throw new Error('Ban transaction was not received');

			const txResponse = await sendTransaction(whitelistRemoveWalletsTx);

			if (txResponse) {
				const { hash } = txResponse;
				await useWhitelistRemoveWalletMutation.fetcher({
					whitelistRemoveWalletData: { userId, daoAddress, transactionHash: hash }
				})();
			} else {
				await Promise.reject();
			}
		} catch (e) {
			await Promise.reject(e);
		}
	});
};

export const useAddWhitelistWallet = () => {
	const { sendTransaction } = useWallet();

	return useMutation(async ({ daoAddress, whitelist }: WhitelistAddWalletsTxQueryVariables) => {
		const parsedWhitelist = Array.isArray(whitelist) ? whitelist : [whitelist];
		const lowerCaseWhitelist = parsedWhitelist.map((w) => ({ ...w, walletAddress: w.walletAddress.toLowerCase() }));

		try {
			const { whitelistAddWalletsTx } =
				(await useWhitelistAddWalletsTxQuery.fetcher({
					daoAddress,
					whitelist: lowerCaseWhitelist
				})()) || {};

			if (!whitelistAddWalletsTx) throw new Error('whitelistAddWalletsTx required');
			const txResponse = await sendTransaction(whitelistAddWalletsTx);

			if (txResponse) {
				const { hash } = txResponse;

				await useWhitelistAddWalletMutation.fetcher({
					whitelistAddWalletData: { daoAddress, items: lowerCaseWhitelist, transactionHash: hash }
				})();
			} else {
				await Promise.reject();
			}
		} catch (e) {
			console.error(e);
			await Promise.reject(e);
		}
	});
};

export const useUpdateWhitelistStatus = () => {
	return useMutation(async ({ id, status }: UpdateWhitelistStatusMutationVariables['updateWhitelistStatusData']) => {
		try {
			await useUpdateWhitelistStatusMutation.fetcher({
				updateWhitelistStatusData: { id, status }
			})();
		} catch (e) {
			await Promise.reject(e);
		}
	});
};
