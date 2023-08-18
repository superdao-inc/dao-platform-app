import { useMutation } from 'react-query';

import { useCreateWalletMutation, CreateWalletMutationVariables } from 'src/gql/wallet.generated';
// import { useWallet } from 'src/providers/walletProvider';

export const useWalletCreate = () => {
	// const { sendTransaction } = useWallet();

	return useMutation(async (params: CreateWalletMutationVariables) => {
		const { createWalletData } = params;

		try {
			// connect app to Superdao OS by sending connectApp transaction

			const data = await useCreateWalletMutation.fetcher({ createWalletData })();

			return data;
		} catch (e) {
			return Promise.reject();
		}
	});
};
