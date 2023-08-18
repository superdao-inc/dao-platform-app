import { TransactionReceipt } from '@ethersproject/providers';
import { Injectable } from '@nestjs/common';

import { provider } from 'src/config';

import { TransactionStatus } from 'src/entities/blockchain/types';

import { TransactionRequest } from './transaction.types';

@Injectable()
export class BlockchainTransactionService {
	constructor() {}

	public async getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt | null> {
		return provider.getTransactionReceipt(transactionHash);
	}

	public async checkTransactionStatus(transactionRequest: TransactionRequest): Promise<TransactionStatus> {
		const { transactionHash } = transactionRequest;

		//TODO: FIXME: regExp was on bcs side, but it fails for normal txHash
		// if (txHashRegExp.test(transactionHash)) {
		// throw new ValidationError('invalid tx hash');
		// }

		try {
			const tx = await this.getTransactionReceipt(transactionHash);
			if (tx == null) {
				return 'AWAIT_CONFIRMATION';
			}

			switch (tx.status) {
				case 1:
					return 'FINALIZED';
				case 0:
					return 'FAILED';
				default:
					return 'AWAIT_CONFIRMATION';
			}
		} catch (error) {
			throw error;
		}
	}
}
