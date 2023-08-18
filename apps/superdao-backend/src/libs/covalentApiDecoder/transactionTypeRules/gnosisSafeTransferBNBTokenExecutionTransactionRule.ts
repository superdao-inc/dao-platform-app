import { BigNumber } from 'ethers';
import { getAddress } from '@sd/superdao-shared';
import {
	WalletTransactionDirection,
	WalletTransactionStatus,
	WalletTransactionType
} from 'src/entities/walletTransaction/models/walletTransaction';
import { mapBNBTokenTransferLogToTransactionPart } from '../logEvents';
import { isExecutionSuccessEvent, isSafeMultiSigTransactionEvent } from '../logEvents.model';
import { TransactionTypeRule } from '../transactions.model';

export const gnosisSafeTransferBNBTokenExecutionTransactionRule: TransactionTypeRule = (tx, context) => {
	if (!BigNumber.from(tx.value).eq(0)) return false;
	const { log_events: logEvents } = tx;
	if (logEvents.length !== 2) return false;
	if (!logEvents.find((e) => isExecutionSuccessEvent(e))) return false;
	const safeMultiSigTransactionEvent = logEvents.find((e) => isSafeMultiSigTransactionEvent(e));
	if (!safeMultiSigTransactionEvent) return false;

	const transferPart = mapBNBTokenTransferLogToTransactionPart(safeMultiSigTransactionEvent, context);
	if (!transferPart) return false;

	const { ecosystem, chainId, walletAddress } = context;
	const { to_address, value, tx_hash, successful, block_signed_at, fees_paid } = tx;
	const formattedWalletAddress = getAddress(walletAddress);
	const formattedFromAddress = getAddress(transferPart.from.address);
	const formattedToAddress = getAddress(to_address);

	return {
		ecosystem: ecosystem,
		chainId: chainId,
		fromAddress: formattedFromAddress,
		toAddress: formattedToAddress,
		value: String(value),
		hash: tx_hash,
		type: formattedWalletAddress === formattedFromAddress ? WalletTransactionType.SEND : WalletTransactionType.RECEIVE,
		status: successful ? WalletTransactionStatus.SUCCESS : WalletTransactionStatus.FAILED,
		executed: block_signed_at,
		gasFee: fees_paid.toString(),
		direction:
			formattedFromAddress === formattedWalletAddress ? WalletTransactionDirection.OUT : WalletTransactionDirection.IN,
		parts: [transferPart],
		walletAddress: formattedWalletAddress,
		description: null
	};
};
