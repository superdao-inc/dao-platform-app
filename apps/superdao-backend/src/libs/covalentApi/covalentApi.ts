/* eslint-disable no-empty-function */

import { RequestOptions, RESTDataSource } from 'apollo-datasource-rest';
import { WalletTransaction } from 'src/entities/walletTransaction/models/walletTransaction';
import { ChainId, EcosystemType } from '@sd/superdao-shared';
import { decodeTransaction } from '../covalentApiDecoder';
import { CovalentBalancesV2Response, CovalentTransactionsV2Response } from './covalentApi.model';
import { TokenBalance } from 'src/entities/wallet/dto/tokenBalance.dto';
import { CovalentTokenBalance } from 'src/libs/covalentApi/index';
import { findTokenByAddress } from 'src/libs/tokens';
import { getAddress } from '@sd/superdao-shared';

type Pagination = {
	pageSize?: number;
	pageNumber?: number;
};
export class CovalentApi extends RESTDataSource {
	constructor(baseURL: string) {
		super();
		this.baseURL = baseURL;
	}

	willSendRequest(request: RequestOptions) {
		request.params.set('key', this.context.covalentApiKey);
	}

	/**
	 * @see https://www.covalenthq.com/docs/api/#/0/Get%20token%20balances%20for%20address/USD/1
	 */
	getBalance = async (chainId: ChainId, address: string, currency = 'USD'): Promise<TokenBalance[]> => {
		const response = await this.get<CovalentBalancesV2Response>(
			`v1/${encodeURIComponent(chainId)}/address/${encodeURIComponent(address)}/balances_v2/`,
			{ 'quote-currency': currency }
		);

		return response.data.items
			.filter((ctb) => {
				const { type, contract_address } = ctb;
				const isApplicableType = type === 'cryptocurrency' || type === 'stablecoin';
				return isApplicableType && findTokenByAddress({ chainId, address: contract_address });
			})
			.map((ctb) => mapCovalentBalanceToTokenBalance(ctb, chainId));
	};

	/**
	 * @see https://www.covalenthq.com/docs/api/#/0/Get%20transactions%20for%20address/USD/1
	 */
	getEvmTransactions = async (
		chainId: ChainId,
		address: string,
		pagination?: Pagination
	): Promise<WalletTransaction[]> => {
		const response = await this.get<CovalentTransactionsV2Response>(
			`v1/${encodeURIComponent(chainId)}/address/${encodeURIComponent(address)}/transactions_v2/`,
			{ 'no-logs': false, 'page-size': pagination?.pageSize, 'page-number': pagination?.pageNumber }
		);

		return response.data.items.map((item) => {
			return decodeTransaction(item, {
				ecosystem: EcosystemType.EVM,
				walletAddress: address,
				chainId: chainId
			});
		});
	};

	getTransaction = async (chainId: ChainId, address: string, hash: string): Promise<WalletTransaction> => {
		const response = await this.get<CovalentTransactionsV2Response>(
			`v1/${encodeURIComponent(chainId)}/transaction_v2/${hash}/`,
			{
				'no-logs': false
			}
		);

		return response.data.items.map((item) => {
			return decodeTransaction(item, {
				ecosystem: EcosystemType.EVM,
				walletAddress: address,
				chainId: chainId
			});
		})[0];
	};
}

const mapCovalentBalanceToTokenBalance = (ctb: CovalentTokenBalance, chainId: ChainId): TokenBalance => {
	const token = findTokenByAddress({
		chainId,
		address: getAddress(ctb.contract_address) || ''
	})!;

	return {
		token,
		quote: {
			currency: 'USD',
			rate: ctb.quote_rate ? String(ctb.quote_rate) : null
		},
		value: String(ctb.quote || 0),
		amount: ctb.balance,
		ecosystem: EcosystemType.EVM,

		// TODO: BACKWARD COMPATIBILITY, REMOVE IN NEXT RELEASE ⬇⬇⬇
		tokenAddress: ctb.contract_address,
		decimals: ctb.contract_decimals,
		logo: token.iconUrl || ctb.logo_url,
		symbol: ctb.contract_ticker_symbol,
		name: ctb.contract_name,
		priceUsd: ctb.quote_rate || 0,
		valueUsd: ctb.quote || 0,
		balance: ctb.balance
	};
};
