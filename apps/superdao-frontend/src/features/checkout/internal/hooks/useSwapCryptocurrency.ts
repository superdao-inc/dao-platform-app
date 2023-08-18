import { useMutation } from 'react-query';
import { IBuildTxResponse, IGetRoutesRequestParams } from '@viaprotocol/router-sdk/dist/types';
import { ethers } from 'ethers';
import { useTranslation } from 'next-i18next';
import { useWallet } from 'src/providers/walletProvider';
import { DefaultTxFragment } from 'src/gql/defaultTxFragment.generated';
import { toast } from 'src/components';
import { getMostProfitableRouteFromVia } from 'src/features/checkout/internal/helpers/getMostProfitableRouteFromVia';
import { viaApi } from 'src/client/via-exchange';
import { VIA_NUM_ACTION } from 'src/features/checkout/internal/constants';
import { delay } from 'src/utils/delay';

export type SwapCryptocurrencyVariables = {
	fromChainId: number;
	fromTokenAddress: string;
	fromAmount: number;
	toChainId: number;
	toTokenAddress: string;
	owner: string;
};

const convertViaTxToOurTx = (tx: IBuildTxResponse): DefaultTxFragment => {
	const { to, data, value } = tx;

	return {
		to,
		data,
		chainId: null,
		from: null,
		nonce: null,
		r: null,
		s: null,
		type: null,
		v: null,
		accessList: null,
		gasLimit: null,
		gasPrice: null,
		maxFeePerGas: null,
		maxPriorityFeePerGas: null,
		value: {
			type: 'BigNumber',
			hex: ethers.BigNumber.from(value.toString())._hex
		}
	};
};

export const useSwapCryptocurrency = (
	onSuccess: () => void,
	onError: (e: any) => void,
	requiredToTokenAmount: string | undefined
) => {
	const { t } = useTranslation();

	const { sendTransaction } = useWallet();

	return useMutation(
		async (variables: SwapCryptocurrencyVariables) => {
			const { fromChainId, fromTokenAddress, fromAmount, toChainId, toTokenAddress, owner } = variables;

			if (!requiredToTokenAmount) {
				toast.error(t('errors.requiredToTokenAmount'));
				return;
			}

			const getRoutesParams: IGetRoutesRequestParams = {
				fromChainId,
				fromTokenAddress,
				fromAmount,
				fromAddress: owner,
				toAddress: owner,
				toChainId,
				toTokenAddress,
				multiTx: false,
				limit: 1
			};

			const route = await getMostProfitableRouteFromVia(getRoutesParams, Number(requiredToTokenAmount));
			if (!route) {
				return;
			}

			/**
			 * The code above just guarantees that received token amount will be > 100% (<= 105%) price on contract
			 * Because of our method that calculates from token amount as 110% of price it will be skipped in most cases
			 * Plays the role of a protector on case when providers are very greedy
			 */

			const routeId = route.id;

			const allowanceStatus = await viaApi.getAllowanceStatus({
				routeId,
				owner,
				numAction: VIA_NUM_ACTION
			});

			if (Number(allowanceStatus.value) < fromAmount) {
				const approvalTx = await viaApi.buildApprovalTx({ routeId, owner, numAction: VIA_NUM_ACTION });
				await sendTransaction(approvalTx as DefaultTxFragment);
			}

			const swapTx = await viaApi.buildTx({
				routeId,
				fromAddress: owner,
				receiveAddress: owner,
				numAction: VIA_NUM_ACTION
			});

			const transferTx = await sendTransaction(convertViaTxToOurTx(swapTx));

			if (!transferTx) throw new Error('transaction error');

			await viaApi.startRoute({
				fromAddress: owner,
				toAddress: owner,
				routeId,
				txHash: transferTx?.hash
			});

			let txStatus = await viaApi.checkTx({
				actionUuid: route.actions[VIA_NUM_ACTION].uuid
			});

			while (txStatus.event !== 'success') {
				await delay(txStatus.retry ?? 30000);

				txStatus = await viaApi.checkTx({
					actionUuid: route.actions[VIA_NUM_ACTION].uuid
				});

				//something went wrong with transaction
				if (['user_tx_failed', 'recieve_tx_not_found', 'null'].includes(txStatus.event)) {
					throw new Error(`transaction error: ${txStatus}`);
				}
			}

			if (Number(txStatus.data?.actualAmount) < route.toTokenAmount * 0.9) {
				throw new Error('transaction value is out of bounds');
			}
		},
		{
			onSuccess,
			onError
		}
	);
};
