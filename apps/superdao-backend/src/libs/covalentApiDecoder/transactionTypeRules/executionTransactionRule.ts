import { BigNumber } from 'ethers';
import curry from 'lodash/curry';
import {
	WalletTransactionDirection,
	WalletTransactionPart,
	WalletTransactionStatus,
	WalletTransactionType
} from 'src/entities/walletTransaction/models/walletTransaction';
import {
	mapErc20TokenTransferLogToTransactionPart,
	mapErc721TokenTransferLogToTransactionPart,
	mapMaticTokenTransferLogToTransactionPart
} from 'src/libs/covalentApiDecoder/logEvents';
import { TransactionTypeRule } from 'src/libs/covalentApiDecoder/transactions.model';

import { isMaticTokenLogTransferEvents } from '../logEvents.model';
import { getNativeTransactionPart } from '../utils';
import { log } from 'src/utils/logger';

export const executionTransactionRule: TransactionTypeRule = (tx, context) => {
	try {
		const logToTransactionPartMappers = [
			mapMaticTokenTransferLogToTransactionPart,
			mapErc20TokenTransferLogToTransactionPart,
			curry(mapErc721TokenTransferLogToTransactionPart)(tx)
		];
		const nativeTransactionParts: WalletTransactionPart[] = [];

		if (!isMaticTokenLogTransferEvents(tx) && BigNumber.from(tx.value).gt(0)) {
			nativeTransactionParts.push(getNativeTransactionPart(tx, context));
		}

		const transactionParts = tx.log_events.reduce(
			(acc, logEvent) => {
				if (!logEvent.decoded_description) return acc;

				for (const logToTransactionPartMapper of logToTransactionPartMappers) {
					const part = logToTransactionPartMapper(logEvent, context);

					if (part) {
						acc.unshift(part);

						return acc;
					}
				}

				return acc;
			},
			[...nativeTransactionParts]
		);

		return {
			ecosystem: context.ecosystem,
			chainId: context.chainId,
			hash: tx.tx_hash,
			fromAddress: tx.from_address,
			toAddress: tx.to_address,
			value: String(tx.value),
			status: tx.successful ? WalletTransactionStatus.SUCCESS : WalletTransactionStatus.FAILED,
			direction:
				tx.from_address === context.walletAddress ? WalletTransactionDirection.OUT : WalletTransactionDirection.IN,
			type: WalletTransactionType.EXECUTION,
			executed: tx.block_signed_at,
			gasFee: tx.fees_paid.toString(),
			parts: transactionParts,
			walletAddress: context.walletAddress,
			description: null
		};
	} catch (error) {
		log.error('[executionTransactionRule]', { error });

		return false;
	}
};
