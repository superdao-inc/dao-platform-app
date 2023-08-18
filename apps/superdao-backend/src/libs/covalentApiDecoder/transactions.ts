import { BigNumber } from 'ethers';

import { gnosisSafeSetupRule } from 'src/libs/covalentApiDecoder/transactionTypeRules/gnosisSafeSetupRule';
import { decodeTransactionLogEvents } from 'src/libs/covalentApiDecoder/logEvents';
import {
	Context,
	CovalentTransactionWithDecodedLogEvents,
	TransactionTypeRule
} from 'src/libs/covalentApiDecoder/transactions.model';
import { erc20DirectTransactionRule } from 'src/libs/covalentApiDecoder/transactionTypeRules/erc20DirectTransactionRule';
import { executionTransactionRule } from 'src/libs/covalentApiDecoder/transactionTypeRules/executionTransactionRule';
import { maticTransactionRule } from 'src/libs/covalentApiDecoder/transactionTypeRules/maticTransactionRule';
import { nativeTransactionRule } from 'src/libs/covalentApiDecoder/transactionTypeRules/nativeTransactionRule';

import {
	WalletTransaction,
	WalletTransactionDirection,
	WalletTransactionStatus,
	WalletTransactionType
} from 'src/entities/walletTransaction/models/walletTransaction';
import { CovalentTransaction } from 'src/libs/covalentApi';
import { getNativeTransactionPart } from './utils';
import { gnosisSafeTransferMaticTokenExecutionTransactionRule } from './transactionTypeRules/gnosisSafeTransferMaticTokenExecutionTransactionRule';
import { gnosisSafeTransferBNBTokenExecutionTransactionRule } from './transactionTypeRules/gnosisSafeTransferBNBTokenExecutionTransactionRule';
import { maticToGnosisSafeTransactionRule } from './transactionTypeRules/maticToGnosisSafeTransactionRule';
import { nativeTokenToGnosisSafeTransactionRule } from './transactionTypeRules/nativeTokenToGnosisSafeTransactionRule';
import { erc721TransactionRule } from './transactionTypeRules/erc721TransactionRule';

const rules: TransactionTypeRule[] = [
	maticTransactionRule,
	erc20DirectTransactionRule,
	gnosisSafeSetupRule,
	nativeTransactionRule,
	maticTransactionRule,
	erc20DirectTransactionRule,
	gnosisSafeTransferMaticTokenExecutionTransactionRule,
	gnosisSafeTransferBNBTokenExecutionTransactionRule,
	maticToGnosisSafeTransactionRule,
	nativeTokenToGnosisSafeTransactionRule,
	erc721TransactionRule,
	executionTransactionRule
];

export const decodeTransaction = (tx: CovalentTransaction, context: Context): WalletTransaction => {
	const { ecosystem, chainId, walletAddress } = context;
	const decodedTransactionLogEvents = decodeTransactionLogEvents(tx.log_events);

	const txWithDecodedLogEvents: CovalentTransactionWithDecodedLogEvents = {
		...tx,
		log_events: decodedTransactionLogEvents
	};

	try {
		for (const rule of rules) {
			const result = rule(txWithDecodedLogEvents, context);

			if (result) {
				return result;
			}
		}
	} catch (err) {}

	const defaultTx: WalletTransaction = {
		ecosystem: ecosystem,
		chainId: chainId,
		fromAddress: tx.from_address,
		toAddress: tx.to_address,
		value: String(tx.value),
		hash: tx.tx_hash,
		type: WalletTransactionType.EXECUTION,
		status: tx.successful ? WalletTransactionStatus.SUCCESS : WalletTransactionStatus.FAILED,
		executed: tx.block_signed_at,
		gasFee: tx.fees_paid.toString(),
		direction: tx.from_address === walletAddress ? WalletTransactionDirection.OUT : WalletTransactionDirection.IN,
		parts: [],
		walletAddress,
		description: null
	};

	if (BigNumber.from(tx.value).gt(0)) {
		defaultTx.parts = [getNativeTransactionPart(tx, context)];
	}

	return defaultTx;
};
