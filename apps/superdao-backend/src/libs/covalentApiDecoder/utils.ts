import { getAddress, getNetworkByChainId } from '@sd/superdao-shared';
import {
	AccountType,
	WalletTransactionDirection,
	WalletTransactionPart
} from 'src/entities/walletTransaction/models/walletTransaction';
import { findTokenBySymbol } from '../tokens';
import { Context, CovalentTransactionWithDecodedLogEvents } from './transactions.model';

export const getNativeTransactionPart = (
	tx: CovalentTransactionWithDecodedLogEvents,
	context: Context
): WalletTransactionPart => {
	const { chainId, walletAddress } = context;
	const { from_address, to_address } = tx;
	const network = getNetworkByChainId(chainId);
	const token = findTokenBySymbol({ chainId, symbol: network?.currencySymbol! });
	const formattedWalletAddress = getAddress(walletAddress);
	const formattedFromAddress = getAddress(from_address);
	const formattedToAddress = getAddress(to_address);
	return {
		token: token!,
		value: tx.value,
		from: {
			type: AccountType.UNKNOWN,
			address: formattedFromAddress
		},
		to: {
			type: AccountType.UNKNOWN,
			address: formattedToAddress
		},
		direction:
			formattedFromAddress === formattedWalletAddress ? WalletTransactionDirection.OUT : WalletTransactionDirection.IN
	};
};
