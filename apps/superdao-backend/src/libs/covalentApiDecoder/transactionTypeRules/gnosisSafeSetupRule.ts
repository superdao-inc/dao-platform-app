import { TransactionTypeRule } from '../transactions.model';
import { isGnosisSafeSetupEvent } from 'src/libs/covalentApiDecoder/logEvents.model';
import {
	WalletTransactionType,
	WalletTransactionDirection,
	WalletTransactionStatus
} from 'src/entities/walletTransaction/models/walletTransaction';
import { log } from 'src/utils/logger';

export const gnosisSafeSetupRule: TransactionTypeRule = (tx, context) => {
	try {
		const { tx_hash } = tx;

		const safeSetupEvents = tx.log_events.filter((logEvent) => isGnosisSafeSetupEvent(logEvent.decoded_description));

		if (safeSetupEvents.length !== 1) return false;

		const safeSetupEvent = safeSetupEvents[0];
		if (!safeSetupEvent) return false;

		return {
			ecosystem: context.ecosystem,
			chainId: context.chainId,
			hash: tx_hash,
			fromAddress: tx.from_address,
			toAddress: safeSetupEvent.sender_address,
			value: String(tx.value),
			status: tx.successful ? WalletTransactionStatus.SUCCESS : WalletTransactionStatus.FAILED,
			type: WalletTransactionType.SAFE_SETUP,
			direction:
				tx.from_address === context.walletAddress ? WalletTransactionDirection.OUT : WalletTransactionDirection.IN,
			executed: tx.block_signed_at,
			gasFee: tx.fees_paid.toString(),
			parts: [],
			walletAddress: context.walletAddress,
			description: null
		};
	} catch (error) {
		log.error('[gnosisSafeSetupRule]', { error });

		return false;
	}
};
