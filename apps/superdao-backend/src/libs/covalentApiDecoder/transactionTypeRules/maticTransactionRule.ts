import { getAddress } from '@sd/superdao-shared';
import {
	WalletTransactionDirection,
	WalletTransactionStatus,
	WalletTransactionType
} from 'src/entities/walletTransaction/models/walletTransaction';
import { mapMaticTokenTransferLogToTransactionPart } from 'src/libs/covalentApiDecoder/logEvents';
import { isLogFeeTransferEvent, isMaticTokenLogTransferEvent } from 'src/libs/covalentApiDecoder/logEvents.model';
import { TransactionTypeRule } from 'src/libs/covalentApiDecoder/transactions.model';
import { log } from 'src/utils/logger';

/**
 * Locates Polygon native token transfers between external wallets
 */
export const maticTransactionRule: TransactionTypeRule = (tx, context) => {
	try {
		const { log_events: logEvents } = tx;

		if (logEvents.length !== 2) return false;
		if (!logEvents.find((e) => isLogFeeTransferEvent(e))) return false;

		const maticTokenLogTransferEvent = logEvents.find((e) => isMaticTokenLogTransferEvent(e));
		if (!maticTokenLogTransferEvent) return false;

		const transferPart = mapMaticTokenTransferLogToTransactionPart(maticTokenLogTransferEvent, context);
		if (!transferPart) return false;

		const fromAddress = getAddress(transferPart.from.address) || '';

		return {
			ecosystem: context.ecosystem,
			chainId: context.chainId,
			hash: tx.tx_hash,
			fromAddress: tx.from_address,
			toAddress: tx.to_address,
			value: String(tx.value),
			status: tx.successful ? WalletTransactionStatus.SUCCESS : WalletTransactionStatus.FAILED,
			type: context.walletAddress === fromAddress ? WalletTransactionType.SEND : WalletTransactionType.RECEIVE,
			direction:
				tx.from_address === context.walletAddress ? WalletTransactionDirection.OUT : WalletTransactionDirection.IN,
			executed: tx.block_signed_at,
			gasFee: tx.fees_paid.toString(),
			parts: [transferPart],
			walletAddress: context.walletAddress,
			description: null
		};
	} catch (error) {
		log.error('[maticTransactionRule]', { error });

		return false;
	}
};
