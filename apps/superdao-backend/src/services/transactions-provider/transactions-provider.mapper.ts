import { CovalentTransaction, CovalentTransactionLogEvent } from '../../libs/covalentApi';
import { components } from './dto.generated';

const mapWalletTransactionLog = (txLog: components['schemas']['TransactionEventLog']): CovalentTransactionLogEvent => {
	return {
		block_signed_at: '',
		block_height: txLog.blockNumber,
		tx_offset: 0,
		log_offset: txLog.offset,
		tx_hash: txLog.txHash,
		raw_log_topics: txLog.topics.split('\n'),
		sender_contract_decimals: 0,
		sender_name: '',
		sender_contract_ticker_symbol: '',
		sender_address: '',
		sender_address_label: null,
		sender_logo_url: '',
		raw_log_data: txLog.data,
		decoded: {
			/** @example 'Transfer' */
			name: '',
			signature: '',
			params: [
				{
					name: '',
					type: '',
					indexed: false,
					decoded: false,
					value: ''
				}
			]
		}
	};
};

export const mapWalletTransaction = (tx: components['schemas']['TransactionDto']): CovalentTransaction => {
	return {
		block_signed_at: tx.blockTimestamp,
		block_height: tx.blockNumber,
		tx_hash: tx.hash,
		tx_offset: tx.offset,
		successful: tx.status == 1,
		from_address: tx.fromAddress,
		from_address_label: null,
		to_address: tx.toAddress,
		to_address_label: null,
		value: tx.value,
		value_quote: 0,
		gas_offered: 0,
		gas_spent: tx.gasUsed,
		gas_price: tx.gasPrice,
		fees_paid: tx.gasUsed * tx.gasPrice,
		gas_quote: 0,
		gas_quote_rate: 0,
		log_events: tx.txLogs.map(mapWalletTransactionLog),
		walletAddress: tx.walletAddress,
		chainId: tx.chainId
	};
};
