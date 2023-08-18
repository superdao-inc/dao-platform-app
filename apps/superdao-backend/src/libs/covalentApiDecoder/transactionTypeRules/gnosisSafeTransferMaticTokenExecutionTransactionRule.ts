import { BigNumber } from 'ethers';
import { getAddress, MATIC_TOKEN_ADDRESS } from '@sd/superdao-shared';
import {
	WalletTransactionDirection,
	WalletTransactionStatus,
	WalletTransactionType
} from 'src/entities/walletTransaction/models/walletTransaction';
import { mapMaticTokenTransferLogToTransactionPart } from '../logEvents';
import {
	isExecutionSuccessEvent,
	isLogFeeTransferEvent,
	isMaticTokenLogTransferEvent,
	isSafeMultiSigTransactionEvent
} from '../logEvents.model';
import { TransactionTypeRule } from '../transactions.model';

export const gnosisSafeTransferMaticTokenExecutionTransactionRule: TransactionTypeRule = (tx, context) => {
	if (!BigNumber.from(tx.value).eq(0)) return false;
	const { log_events: logEvents } = tx;
	if (logEvents.length !== 4) return false;
	if (!logEvents.find((e) => !isSafeMultiSigTransactionEvent(e))) return false;
	if (!logEvents.find((e) => isLogFeeTransferEvent(e))) return false;
	if (!logEvents.find((e) => isExecutionSuccessEvent(e))) return false;

	const maticTokenLogTransferEvent = logEvents.find((e) => isMaticTokenLogTransferEvent(e));
	if (!maticTokenLogTransferEvent) return false;
	if (maticTokenLogTransferEvent.sender_address !== MATIC_TOKEN_ADDRESS) return false;

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
		type: fromAddress === walletAddress ? WalletTransactionType.SEND : WalletTransactionType.RECEIVE,
		direction:
			tx.from_address === context.walletAddress ? WalletTransactionDirection.OUT : WalletTransactionDirection.IN,
		executed: tx.block_signed_at,
		gasFee: tx.fees_paid.toString(),
		parts: [transferPart],
		walletAddress,
		description: null
	};
};
