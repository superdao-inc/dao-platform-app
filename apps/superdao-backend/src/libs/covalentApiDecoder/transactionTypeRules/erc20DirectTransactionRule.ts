import { getAddress } from '@sd/superdao-shared';
import {
	WalletTransactionDirection,
	WalletTransactionStatus,
	WalletTransactionType
} from 'src/entities/walletTransaction/models/walletTransaction';
import { mapErc20TokenTransferLogToTransactionPart } from 'src/libs/covalentApiDecoder/logEvents';
import { isErc20TokenTransferEvent } from 'src/libs/covalentApiDecoder/logEvents.model';
import { TransactionTypeRule } from '../transactions.model';
import { log } from 'src/utils/logger';

/**
 * Locates direct ("one-step") whitelisted ERC-20 token transfers
 */
export const erc20DirectTransactionRule: TransactionTypeRule = (tx, context) => {
	try {
		const { tx_hash } = tx;
		const { walletAddress } = context;

		const erc20TokenTransferEvents = tx.log_events.filter((logEvent) => isErc20TokenTransferEvent(logEvent));

		// Should be one-step transfer
		if (erc20TokenTransferEvents.length !== 1) return false;

		const erc20TokenTransferEvent = erc20TokenTransferEvents[0];
		if (!erc20TokenTransferEvent) return false;

		const transferPart = mapErc20TokenTransferLogToTransactionPart(erc20TokenTransferEvent, context);
		if (!transferPart) {
			return false;
		}

		const condition = erc20TokenTransferEvent && transferPart;

		if (!condition) {
			return false;
		}

		const fromAddress = getAddress(transferPart.from.address) || '';

		return {
			ecosystem: context.ecosystem,
			chainId: context.chainId,
			hash: tx_hash,
			fromAddress: tx.from_address,
			toAddress: tx.to_address,
			value: String(tx.value),
			status: tx.successful ? WalletTransactionStatus.SUCCESS : WalletTransactionStatus.FAILED,
			type: fromAddress === walletAddress ? WalletTransactionType.SEND : WalletTransactionType.RECEIVE,
			direction:
				tx.from_address === context.walletAddress ? WalletTransactionDirection.OUT : WalletTransactionDirection.IN,
			executed: tx.block_signed_at,
			gasFee: tx.fees_paid.toString(),
			parts: [transferPart],
			walletAddress,
			description: null
		};
	} catch (error) {
		log.error('[erc20DirectTransactionRule]', error);

		return false;
	}
};
