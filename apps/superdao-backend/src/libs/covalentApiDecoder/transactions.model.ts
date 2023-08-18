import { LogDescription } from 'ethers/lib/utils';
import { ChainId, EcosystemType } from '@sd/superdao-shared';

import { WalletTransaction } from 'src/entities/walletTransaction/models/walletTransaction';
import { CovalentTransaction } from 'src/libs/covalentApi';
import { CovalentTransactionLogEvent } from 'src/libs/covalentApi/covalentApi.model';

export type Context = {
	walletAddress: string;
	ecosystem: EcosystemType;
	chainId: ChainId;
};

export type CovalentTransactionLogEventWithDecodedDescription = CovalentTransactionLogEvent & {
	decoded_description?: LogDescription;
};
export type CovalentTransactionWithDecodedLogEvents = Omit<CovalentTransaction, 'log_events'> & {
	log_events: CovalentTransactionLogEventWithDecodedDescription[];
};

/**
 * Transaction heuristic.
 * Returns ether false or WalletTransaction.
 */
export type TransactionTypeRule = (
	tx: CovalentTransactionWithDecodedLogEvents,
	context: Context
) => false | WalletTransaction;
