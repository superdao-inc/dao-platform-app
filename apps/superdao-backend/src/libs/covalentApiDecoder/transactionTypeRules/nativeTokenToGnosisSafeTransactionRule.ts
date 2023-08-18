import { getAddress } from '@sd/superdao-shared';
import {
	WalletTransactionDirection,
	WalletTransactionStatus,
	WalletTransactionType
} from 'src/entities/walletTransaction/models/walletTransaction';
import { isSafeReceivedEvent } from 'src/libs/covalentApiDecoder/logEvents.model';
import { TransactionTypeRule } from 'src/libs/covalentApiDecoder/transactions.model';
import { getNativeTransactionPart } from '../utils';
import { log } from 'src/utils/logger';

export const nativeTokenToGnosisSafeTransactionRule: TransactionTypeRule = (tx, context) => {
	try {
		const { log_events: logEvents } = tx;

		if (logEvents.length !== 1) return false;
		if (!logEvents.find((e) => isSafeReceivedEvent(e))) return false;

		const transferPart = getNativeTransactionPart(tx, context);
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
		log.error('[nativeTokenToGnosisSafeTransactionRule]', { error });

		return false;
	}
};
