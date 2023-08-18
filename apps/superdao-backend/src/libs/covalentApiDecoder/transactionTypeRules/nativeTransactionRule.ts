import { BigNumber } from 'ethers';
import { getAddress } from '@sd/superdao-shared';
import {
	WalletTransactionDirection,
	WalletTransactionStatus,
	WalletTransactionType
} from 'src/entities/walletTransaction/models/walletTransaction';
import { TransactionTypeRule } from 'src/libs/covalentApiDecoder/transactions.model';
import { getNativeTransactionPart } from '../utils';
import { log } from 'src/utils/logger';

export const nativeTransactionRule: TransactionTypeRule = (tx, context) => {
	try {
		if (tx.log_events.length !== 0 || BigNumber.from(tx.value).eq(0)) return false;

		const { ecosystem, chainId, walletAddress } = context;
		const { from_address, to_address, value, tx_hash, successful, block_signed_at, fees_paid } = tx;
		const formattedWalletAddress = getAddress(walletAddress);
		const formattedFromAddress = getAddress(from_address);
		const formattedToAddress = getAddress(to_address);
		const parts = [getNativeTransactionPart(tx, context)];

		return {
			ecosystem: ecosystem,
			chainId: chainId,
			fromAddress: formattedFromAddress,
			toAddress: formattedToAddress,
			value: String(value),
			hash: tx_hash,
			type:
				formattedWalletAddress === formattedFromAddress ? WalletTransactionType.SEND : WalletTransactionType.RECEIVE,
			status: successful ? WalletTransactionStatus.SUCCESS : WalletTransactionStatus.FAILED,
			executed: block_signed_at,
			gasFee: fees_paid.toString(),
			direction:
				formattedFromAddress === formattedWalletAddress
					? WalletTransactionDirection.OUT
					: WalletTransactionDirection.IN,
			parts,
			walletAddress: formattedWalletAddress,
			description: null
		};
	} catch (e) {
		log.error('[nativeTransactionRule]', { e });
		return false;
	}
};
