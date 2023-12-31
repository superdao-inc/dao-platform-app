// NOT (NOT) AUTOGENERATED, MAKE CHANGES IF NECESSARY
// transactions_v2 endpoint typings

export type CovalentTransaction = {
	/** @example '2022-04-07T07:25:56Z' */
	block_signed_at: string;

	/** @example 25830772 */
	block_height: number;

	/** @example '0xb30d9130e4d1ea88d8b34d5479117343b18a05f506bed33b1d45ec60506a34de' */
	tx_hash: string;

	tx_offset: number;
	successful: boolean;
	from_address: string | null;
	from_address_label: null;
	to_address: string | null;
	to_address_label: null;

	/** @example '1757345000000000' */
	value: string;

	/** @example 0.002640628625087142 */
	value_quote: number;
	gas_offered: number;
	gas_spent: number;
	gas_price: number;
	fees_paid: number;
	gas_quote: number;
	gas_quote_rate: number;
	log_events: CovalentTransactionLogEvent[];
	walletAddress: string;
	chainId: number;
};

export type CovalentTransactionLogEvent = {
	/** @example '2022-04-08T22:39:05Z' */
	block_signed_at: string;
	block_height: number;
	tx_offset: number;
	log_offset: number;

	/** @example '0x330890d200a049899971d11c6e9d71eb1b22842dd6799552a8d6fc4cf5c0bbf1' */
	tx_hash: string;
	raw_log_topics: string[];

	sender_contract_decimals: 0;

	/** @example 'EVMavericks' */
	sender_name: string;

	/** @example 'EVM' */
	sender_contract_ticker_symbol: string;
	sender_address: string;
	sender_address_label: null;

	/** @example 'https://logos.covalenthq.com/tokens/1/0x7ddaa898d33d7ab252ea5f89f96717c47b2fee6e.png' */
	sender_logo_url: string;
	raw_log_data: string;
	decoded: {
		/** @example 'Transfer' */
		name: string;
		signature: string;
		params: {
			name: string;
			type: string;
			indexed: boolean;
			decoded: boolean;
			value: null | string;
		}[];
	};
};

/**
 * @see https://www.covalenthq.com/docs/api/#/0/Get%20transactions%20for%20address/USD/1
 */
export type CovalentTransactionsV2Response = {
	data: {
		/** @example '0xa79e63e78eec28741e711f89a672a4c40876ebf3' */
		address: string;

		/** @example '2022-04-15T07:30:56.608627336Z' */
		updated_at: string;

		/** @example '2022-04-15T07:35:56.608627487Z' */
		next_update_at: string;

		quote_currency: 'USD';
		chain_id: number;
		items: CovalentTransaction[];
		pagination: {
			has_more: boolean;

			/** Page number (starts from zero) */
			page_number: number;
			page_size: number;
			total_count: null | number;
		};
	};
	error: boolean;
	error_message: null | string;
	error_code: null | string;
};

export type CovalentTokenBalance = {
	contract_decimals: number;
	contract_name: string;
	contract_ticker_symbol: string;
	contract_address: string;

	/** The standard interface(s) supported for this token, eg: ERC-20. */
	supports_erc: string[];
	logo_url: string;
	last_transferred_at: string;

	/** One of cryptocurrency, stablecoin, nft or dust. */
	type: 'cryptocurrency' | 'stablecoin' | 'nft' | 'dust';

	/** The asset balance. Use contract_decimals to scale this balance for display purposes. */
	balance: string;

	/** The asset balance 24 hours ago. */
	balance_24h: string;

	/** The current spot exchange rate in quote-currency. */
	quote_rate: number | null;
	quote_rate_24h: number | null;

	/** The current balance converted to fiat in quote-currency. */
	quote: number | null;
	quote_24h: number | null;

	/** Array of NFTs that are held under this contract. */
	nft_data: [];
	INFTMetadata: {};
};

/**
 * @see https://www.covalenthq.com/docs/api/#/0/Get%20token%20balances%20for%20address/USD/1
 */
export type CovalentBalancesV2Response = {
	data: {
		address: string;
		updated_at: string;
		next_update_at: string;

		/** The requested fiat currency. */
		quote_currency: string;
		items: CovalentTokenBalance[];
	};
};

/**
 * @see https://www.covalenthq.com/docs/api/#/0/Get%20a%20transaction/USD/1
 */
export type CovalentGetTransactionV2Response = {
	data: {
		updated_at: string;
		items: CovalentTransaction[];
	};
};
