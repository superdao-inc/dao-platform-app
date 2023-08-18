import { useMutation } from 'react-query';

import { useWallet } from 'src/providers/walletProvider';
import {
	GrantMemberRoleTxQueryVariables,
	RevokeMemberRoleTxQueryVariables,
	useBanMemberTxQuery,
	useGrantMemberRoleTxQuery,
	useRevokeMemberRoleTxQuery
} from 'src/gql/transaction.generated';
import {
	useBanMemberMutation,
	useGrantMemberRoleMutation,
	useRevokeMemberRoleMutation
} from 'src/gql/daoMembership.generated';

import { useGetBanMembersMetaTxParamsQuery } from 'src/gql/metaTransaction.generated';
import { TransactionResponse } from '@ethersproject/abstract-provider';

type BanUserArgs = { userId: string; daoAddress: string; tokenIds: string[]; nftCount?: number; isGasless: boolean };

const banMembers = async (transactionHash: string, args: BanUserArgs) => {
	const { userId, daoAddress, nftCount, tokenIds, isGasless } = args;
	return useBanMemberMutation.fetcher({
		banMemberData: { userId, daoAddress, transactionHash, isGasless, shouldBurn: nftCount !== tokenIds.length }
	})();
};

export const useBanUser = () => {
	const { canSendMetaTransaction } = useWallet();
	const { mutateAsync: getBanUsersTx } = useGetBanUsersTx();
	const { mutateAsync: getBanUsersTxGasless } = useGetBanUsersTxGasless();

	return useMutation<unknown, Error, BanUserArgs>(async (args: BanUserArgs) => {
		const isGasless = canSendMetaTransaction();
		const getTransaction = isGasless ? getBanUsersTxGasless : getBanUsersTx;

		const txResponse = (await getTransaction(args)) as TransactionResponse;

		if (!txResponse) {
			return Promise.reject();
		}

		return banMembers(txResponse.hash, { ...args, isGasless });
	});
};

export const useGetBanUsersTx = () => {
	const { sendTransaction } = useWallet();
	return useMutation<unknown, Error, BanUserArgs>(async (args: BanUserArgs) => {
		const { userId, daoAddress, tokenIds } = args;
		const { banMemberTx } = (await useBanMemberTxQuery.fetcher({ userId, daoAddress, tokenIds })()) || {};
		if (!banMemberTx) throw new Error('Ban transaction was not received');

		return sendTransaction(banMemberTx);
	});
};

const useGetBanUsersTxGasless = () => {
	const { sendMetaTransaction } = useWallet();

	return useMutation<unknown, Error, BanUserArgs>(async (args: BanUserArgs) => {
		const { daoAddress, tokenIds } = args;

		const banRequestParamsRes = await useGetBanMembersMetaTxParamsQuery.fetcher({
			GetBanMembersMetaTxParamsInput: {
				daoAddress,
				tokenIds
			}
		})();

		if (!banRequestParamsRes?.getBanMembersMetaTxParams) throw new Error('Ban request options were not received');
		const { getBanMembersMetaTxParams: metaTxParams } = banRequestParamsRes;

		return sendMetaTransaction(metaTxParams);
	});
};

export const useGrantMemberRole = () => {
	const { sendTransaction } = useWallet();

	return useMutation<unknown, Error, GrantMemberRoleTxQueryVariables>(
		async ({ changeMemberRoleData: { daoAddress, userWalletAddress, role } }: GrantMemberRoleTxQueryVariables) => {
			try {
				const { grantMemberRoleTx } =
					(await useGrantMemberRoleTxQuery.fetcher({
						changeMemberRoleData: {
							daoAddress,
							userWalletAddress,
							role
						}
					})()) || {};

				if (!grantMemberRoleTx) {
					throw Error;
				}

				const txResponse = await sendTransaction(grantMemberRoleTx);

				if (txResponse) {
					const { hash } = txResponse;
					await useGrantMemberRoleMutation.fetcher({
						grantMemberRoleData: { daoAddress, userWalletAddress, role, transactionHash: hash }
					})();
				} else {
					await Promise.reject();
				}
			} catch (e) {
				return await Promise.reject(e);
			}
		}
	);
};

export const useRevokeMemberRole = () => {
	const { sendTransaction } = useWallet();

	return useMutation<unknown, Error, RevokeMemberRoleTxQueryVariables>(
		async ({ changeMemberRoleData: { daoAddress, userWalletAddress, role } }: RevokeMemberRoleTxQueryVariables) => {
			try {
				const { revokeMemberRoleTx } =
					(await useRevokeMemberRoleTxQuery.fetcher({
						changeMemberRoleData: {
							daoAddress,
							userWalletAddress,
							role
						}
					})()) || {};

				if (!revokeMemberRoleTx) {
					throw Error;
				}

				const txResponse = await sendTransaction(revokeMemberRoleTx);

				if (txResponse) {
					const { hash } = txResponse;
					await useRevokeMemberRoleMutation.fetcher({
						revokeMemberRoleData: { daoAddress, userWalletAddress, role, transactionHash: hash }
					})();
				}
			} catch (e) {
				return await Promise.reject(e);
			}
		}
	);
};
