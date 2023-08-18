import { useMutation } from 'react-query';
import { PopulatedTransaction } from 'ethers';
import { NftAdminUpdateSaleTxInput } from 'src/types/types.generated';
import { useWallet } from 'src/providers/walletProvider';
import { useNftAdminUpdateSaleMutation, useNftAdminUpdateSaleTxQuery } from 'src/gql/nftAdmin.generated';

export const useUpdateSale = () => {
	const { sendPopulatedTransaction } = useWallet();

	return useMutation<unknown, Error, NftAdminUpdateSaleTxInput>(async ({ daoAddress, type, options }) => {
		const { nftAdminUpdateSaleTx } =
			(await useNftAdminUpdateSaleTxQuery.fetcher({ updateSaleData: { type, daoAddress, options } })()) || {};

		if (!nftAdminUpdateSaleTx) {
			await Promise.reject('Update sale transaction was not received');
			return;
		}

		const updateSaleTxResponse = await sendPopulatedTransaction({
			to: nftAdminUpdateSaleTx.to,
			data: nftAdminUpdateSaleTx.data
		} as PopulatedTransaction);

		if (!updateSaleTxResponse) {
			return;
		}

		await useNftAdminUpdateSaleMutation.fetcher({
			data: { daoAddress, transactionHash: updateSaleTxResponse?.hash ?? '', type }
		})();
	});
};
