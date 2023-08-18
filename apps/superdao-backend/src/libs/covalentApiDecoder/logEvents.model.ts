import { BigNumber } from 'ethers';
import { LogDescription, Result } from 'ethers/lib/utils';

import {
	Context,
	CovalentTransactionLogEventWithDecodedDescription,
	CovalentTransactionWithDecodedLogEvents
} from 'src/libs/covalentApiDecoder/transactions.model';

import { WalletTransactionPart } from 'src/entities/walletTransaction/models/walletTransaction';

export interface IMaticLogTransferLogDescription extends LogDescription {
	name: 'LogTransfer';
	signature: 'LogTransfer(address,address,address,uint256,uint256,uint256,uint256,uint256)';
	args: Result &
		[string, string, string, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
			token: string;
			from: string;
			to: string;
			amount: BigNumber;
			input1: BigNumber;
			input2: BigNumber;
			output1: BigNumber;
			output2: BigNumber;
		};
}

export interface IErc20TransferDescription extends LogDescription {
	name: 'Transfer';
	signature: 'Transfer(address,address,uint256)';
	args: Result & [string, string, BigNumber] & { from: string; to: string; value: BigNumber };
}

export interface IGnosisSafeSetupDescription extends LogDescription {
	name: 'SafeSetup';
	signature: 'SafeSetup(address,address[],uint256,address,address)';
}
export interface IErc721TransferDescription extends IErc20TransferDescription {}
export interface ISafeMultiSigTransactionDescription extends LogDescription {
	name: 'SafeMultiSigTransaction';
	signature: 'SafeMultiSigTransaction(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,bytes,bytes)';
	args: Result &
		[string, BigNumber, string, number, BigNumber, BigNumber, BigNumber, string, string, string, string] & {
			to: string;
			value: BigNumber;
			data: string;
			operation: number;
			sageTxGas: BigNumber;
			baseGas: BigNumber;
			gasPrice: BigNumber;
			gasToken: string;
			refundReceiver: string;
			signatures: string;
			additionalInfo: string;
		};
}

export interface IExecutionSuccessDescription extends LogDescription {
	name: 'ExecutionSuccess';
	signature: 'ExecutionSuccess(bytes32 txHash, uint256 payment)';
	args: Result &
		[string, BigNumber] & {
			txHash: string;
			payment: BigNumber;
		};
}

export interface ILogFeeTransferDectiption extends LogDescription {
	name: 'LogFeeTransfer';
	signature: 'LogFeeTransfer(address,address,address,uint256,uint256,uint256,uint256,uint256)';
	args: Result &
		[string, string, string, BigNumber, BigNumber, BigNumber, BigNumber, BigNumber] & {
			token: string;
			from: string;
			to: string;
			amount: BigNumber;
			input1: BigNumber;
			input2: BigNumber;
			output1: BigNumber;
			output2: BigNumber;
		};
}

export interface ISafeReceivedDescription extends LogDescription {
	name: 'SafeReceived';
	signature: 'SafeReceived(address,uint256)	';
	args: Result &
		[string, BigNumber] & {
			address: string;
			value: BigNumber;
		};
}

export function isMaticTokenLogTransferEvent(
	log: CovalentTransactionLogEventWithDecodedDescription
): log is CovalentTransactionLogEventWithDecodedDescription & {
	decoded_description: IMaticLogTransferLogDescription;
} {
	return (
		!!log.decoded_description &&
		log.decoded_description.signature === 'LogTransfer(address,address,address,uint256,uint256,uint256,uint256,uint256)'
	);
}

export function isMaticTokenLogTransferEvents(tx: CovalentTransactionWithDecodedLogEvents): boolean {
	return tx.log_events.filter((logEvent) => isMaticTokenLogTransferEvent(logEvent)).length > 0;
}

export function isErc20TokenTransferEvent(
	log: CovalentTransactionLogEventWithDecodedDescription
): log is CovalentTransactionLogEventWithDecodedDescription & {
	decoded_description: IErc20TransferDescription;
} {
	return (
		!!log.decoded_description &&
		log.decoded_description.signature === 'Transfer(address,address,uint256)' &&
		!!log.raw_log_data
	);
}

export function isErc721TokenTransferEvent(
	log: CovalentTransactionLogEventWithDecodedDescription
): log is CovalentTransactionLogEventWithDecodedDescription & {
	decoded_description: IErc20TransferDescription;
} {
	return (
		!!log.decoded_description &&
		log.decoded_description.signature === 'Transfer(address,address,uint256)' &&
		!log.raw_log_data
	);
}

export function isGnosisSafeSetupEvent(
	logDescription: LogDescription | IGnosisSafeSetupDescription | undefined
): logDescription is IGnosisSafeSetupDescription {
	return !!logDescription && logDescription.signature === 'SafeSetup(address,address[],uint256,address,address)';
}

export function isSafeMultiSigTransactionEvent(
	log: CovalentTransactionLogEventWithDecodedDescription
): log is CovalentTransactionLogEventWithDecodedDescription & {
	decoded_description: ISafeMultiSigTransactionDescription;
} {
	return (
		!!log.decoded_description &&
		log.decoded_description.signature ===
			'SafeMultiSigTransaction(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,bytes,bytes)'
	);
}

export function isExecutionSuccessEvent(
	log: CovalentTransactionLogEventWithDecodedDescription
): log is CovalentTransactionLogEventWithDecodedDescription & {
	decoded_description: IExecutionSuccessDescription;
} {
	return !!log.decoded_description && log.decoded_description.signature === 'ExecutionSuccess(bytes32,uint256)';
}

export function isLogFeeTransferEvent(
	log: CovalentTransactionLogEventWithDecodedDescription
): log is CovalentTransactionLogEventWithDecodedDescription & {
	decoded_description: ILogFeeTransferDectiption;
} {
	return (
		!!log.decoded_description &&
		log.decoded_description.signature ===
			'LogFeeTransfer(address,address,address,uint256,uint256,uint256,uint256,uint256)'
	);
}

export function isSafeReceivedEvent(
	log: CovalentTransactionLogEventWithDecodedDescription
): log is CovalentTransactionLogEventWithDecodedDescription & {
	decoded_description: ISafeReceivedDescription;
} {
	return !!log.decoded_description && log.decoded_description.signature === 'SafeReceived(address,uint256)';
}

export type TransactionLogToTransactionPartMapper = (
	logEventWithDescription: CovalentTransactionLogEventWithDecodedDescription,
	context: Context
) => false | WalletTransactionPart;
