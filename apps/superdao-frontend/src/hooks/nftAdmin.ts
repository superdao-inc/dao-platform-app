import { useMutation } from 'react-query';
import { useNftAdminUpdateCollectionMutation, useNftAdminUpdateCollectionTxQuery } from 'src/gql/nftAdmin.generated';
import { useWallet } from 'src/providers/walletProvider';

import { NftAdminUpdateCollectionTxInput } from 'src/types/types.generated';

type UpdateCollectionVariables = {
	daoAddress: string;
	data: NftAdminUpdateCollectionTxInput;
};

export const useUpdateCollection = () => {
	const { sendTransaction } = useWallet();

	return useMutation<unknown, Error, UpdateCollectionVariables>(
		async ({ daoAddress, data }: UpdateCollectionVariables) => {
			try {
				const { nftAdminUpdateCollectionTx } =
					(await useNftAdminUpdateCollectionTxQuery.fetcher({ daoAddress, data })()) || {};

				if (!nftAdminUpdateCollectionTx) throw new Error('Ban transaction was not received');

				const txResponse = await sendTransaction(nftAdminUpdateCollectionTx);
				if (txResponse) {
					const { hash: transactionHash } = txResponse;
					await useNftAdminUpdateCollectionMutation.fetcher({ data: { transactionHash, daoAddress } })();
				} else {
					await Promise.reject();
				}
			} catch (error) {}
		}
	);
};
