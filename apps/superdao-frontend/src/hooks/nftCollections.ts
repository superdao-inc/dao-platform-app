import { useMutation } from 'react-query';

import {
	AirdropTxQueryVariables,
	useAirdropTxQuery,
	useSaveClaimWhiteListTxQuery,
	WhitelistAddWalletsTxQueryVariables
} from 'src/gql/transaction.generated';

import { useAirdropMutation, useSaveClaimWhitelistMutation } from 'src/gql/nft.generated';
import { useWallet } from 'src/providers/walletProvider';

import { useGetAirdropMetaTxParamsQuery } from 'src/gql/metaTransaction.generated';

export const useSaveClaimWhitelist = () => {
	const { sendTransaction } = useWallet();

	return useMutation(async ({ daoAddress, whitelist }: WhitelistAddWalletsTxQueryVariables) => {
		try {
			const { saveClaimWhitelistTx } =
				(await useSaveClaimWhiteListTxQuery.fetcher({
					daoAddress,
					whitelist
				})()) || {};
			if (!saveClaimWhitelistTx) throw new Error('');

			const txResponse = await sendTransaction(saveClaimWhitelistTx);

			if (txResponse) {
				const { hash } = txResponse;
				const parsedWhitelist = Array.isArray(whitelist) ? whitelist : [whitelist];

				await useSaveClaimWhitelistMutation.fetcher({
					whitelistData: { daoAddress, items: parsedWhitelist, transactionHash: hash }
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

export const useAirdropByWallet = () => {
	const { canSendMetaTransaction } = useWallet();
	const { mutateAsync: getAirdropUsualTx } = useGetAirdropByWalletTx();
	const { mutateAsync: getAirdropGaslessTx } = useGetAirdropByWalletGaslessTx();

	return useMutation(async ({ daoAddress, items }: AirdropTxQueryVariables) => {
		try {
			//Проверка на то массив ли, graphql на место где масссив все равно говорит что может не массив быть
			const arrayedItems = Array.isArray(items) ? items : [items];
			//Тут приходится делать такую фильтрацию проверку потому что есть такой сценарий где у нас идет airdrop по емейлам
			//В запросе useAirdropMutation будет сообщение в рэббит, и там для корректного отображения тоста <N NFTs sent> надо показывать общее количество
			//А здесь мы фильтруем для запроса useAirdropTx
			const onlyWalletItems = arrayedItems.filter((member) => member.walletAddress);

			const isGasless = canSendMetaTransaction();
			const getAirdropTx = isGasless ? getAirdropGaslessTx : getAirdropUsualTx;
			const txResponse = await getAirdropTx({ items: onlyWalletItems, daoAddress });

			if (!txResponse) {
				throw new Error(`No airdrop tx response`);
			}

			const { hash } = txResponse;
			const parsedAirdrop = Array.isArray(items) ? items : [items];

			await useAirdropMutation.fetcher({
				airdropData: { daoAddress, items: parsedAirdrop, transactionHash: hash, isGasless }
			})();
		} catch (e) {
			await Promise.reject(e);
		}
	});
};

const useGetAirdropByWalletTx = () => {
	const { sendTransaction } = useWallet();

	return useMutation(async ({ items, daoAddress }: AirdropTxQueryVariables) => {
		const { airdropTx } =
			(await useAirdropTxQuery.fetcher({
				daoAddress,
				items
			})()) || {};

		if (!airdropTx) throw new Error(`Didn't get airdrop tx params`);

		return sendTransaction(airdropTx);
	});
};

const useGetAirdropByWalletGaslessTx = () => {
	const { sendMetaTransaction } = useWallet();

	return useMutation(async ({ items, daoAddress }: AirdropTxQueryVariables) => {
		const { getAirdropMetaTxParams } = (await useGetAirdropMetaTxParamsQuery.fetcher({ daoAddress, items })()) || {};
		if (!getAirdropMetaTxParams) throw new Error(`Didn't get airdrop meta tx params`);

		return sendMetaTransaction(getAirdropMetaTxParams);
	});
};
