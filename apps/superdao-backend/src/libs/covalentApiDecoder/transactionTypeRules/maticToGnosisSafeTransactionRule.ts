import { getAddress } from '@sd/superdao-shared';
import {
	WalletTransactionDirection,
	WalletTransactionStatus,
	WalletTransactionType
} from 'src/entities/walletTransaction/models/walletTransaction';
import { mapMaticTokenTransferLogToTransactionPart } from 'src/libs/covalentApiDecoder/logEvents';
import {
	isLogFeeTransferEvent,
	isMaticTokenLogTransferEvent,
	isSafeReceivedEvent
} from 'src/libs/covalentApiDecoder/logEvents.model';
import { TransactionTypeRule } from 'src/libs/covalentApiDecoder/transactions.model';
import { log } from 'src/utils/logger';

export const maticToGnosisSafeTransactionRule: TransactionTypeRule = (tx, context) => {
	try {
		const { log_events: logEvents } = tx;

		if (logEvents.length !== 3) return false;
		if (!logEvents.find((e) => isLogFeeTransferEvent(e))) return false;
		if (!logEvents.find((e) => isSafeReceivedEvent(e))) return false;

		const maticTokenLogTransferEvent = logEvents.find((e) => isMaticTokenLogTransferEvent(e));
		if (!maticTokenLogTransferEvent) return false;

		const transferPart = mapMaticTokenTransferLogToTransactionPart(maticTokenLogTransferEvent, context);
		if (!transferPart) return false;

		const fromAddress = getAddress(transferPart.from.address) || '';
		const walletAddress = getAddress(context.walletAddress);
		return {
			ecosystem: context.ecosystem,
			chainId: context.chainId,
			hash: tx.tx_hash,
			fromAddress: tx.from_address,
			toAddress: tx.to_address,
			value: String(tx.value),
			status: tx.successful ? WalletTransactionStatus.SUCCESS : WalletTransactionStatus.FAILED,
			type: walletAddress === fromAddress ? WalletTransactionType.SEND : WalletTransactionType.RECEIVE,
			direction: walletAddress === walletAddress ? WalletTransactionDirection.OUT : WalletTransactionDirection.IN,
			executed: tx.block_signed_at,
			gasFee: tx.fees_paid.toString(),
			parts: [transferPart],
			walletAddress,
			description: null
		};
	} catch (error) {
		log.error('[maticToGnosisSafeTransactionRule]', { error });

		return false;
	}
};
