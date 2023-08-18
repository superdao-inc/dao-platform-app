import { getAddress } from '@sd/superdao-shared';
import {
	WalletTransactionDirection,
	WalletTransactionStatus,
	WalletTransactionType
} from 'src/entities/walletTransaction/models/walletTransaction';
import { mapErc721TokenTransferLogToTransactionPart } from 'src/libs/covalentApiDecoder/logEvents';
import { isErc721TokenTransferEvent } from 'src/libs/covalentApiDecoder/logEvents.model';
import { TransactionTypeRule } from '../transactions.model';
import { log } from 'src/utils/logger';

export const erc721TransactionRule: TransactionTypeRule = (tx, context) => {
	try {
		const { tx_hash } = tx;
		const { walletAddress } = context;
		const erc721TokenTransferEvents = tx.log_events.filter((logEvent) => isErc721TokenTransferEvent(logEvent));

		if (erc721TokenTransferEvents.length !== 1) return false;

		const erc721TokenTransferEvent = erc721TokenTransferEvents[0];
		if (!erc721TokenTransferEvent) return false;

		const transferPart = mapErc721TokenTransferLogToTransactionPart(tx, erc721TokenTransferEvent, context);
		if (!transferPart) {
			return false;
		}

		const condition = erc721TokenTransferEvent && transferPart;

		if (!condition) {
			return false;
		}

		const fromAddress = getAddress(transferPart.from.address) || '';

		return {
			ecosystem: context.ecosystem,
			chainId: context.chainId,
			hash: tx_hash,
			fromAddress: tx.from_address,
			toAddress: tx.to_address,
			value: String(tx.value),
			status: tx.successful ? WalletTransactionStatus.SUCCESS : WalletTransactionStatus.FAILED,
			type: fromAddress === walletAddress ? WalletTransactionType.SEND_NFT : WalletTransactionType.RECEIVE_NFT,
			direction:
				tx.from_address === context.walletAddress ? WalletTransactionDirection.OUT : WalletTransactionDirection.IN,
			executed: tx.block_signed_at,
			gasFee: tx.fees_paid.toString(),
			parts: [transferPart],
			walletAddress,
			description: null
		};
	} catch (error) {
		log.error('[erc721TransactionRule]', error);

		return false;
	}
};
