import { utils } from 'ethers';
import defaultTo from 'lodash/defaultTo';
import { getAddress, getNetworkByChainId } from '@sd/superdao-shared';
import {
	AccountType,
	WalletTransactionDirection,
	WalletTransactionPart
} from 'src/entities/walletTransaction/models/walletTransaction';
import { CovalentTransactionLogEvent } from 'src/libs/covalentApi/covalentApi.model';
import {
	isErc20TokenTransferEvent,
	isErc721TokenTransferEvent,
	isMaticTokenLogTransferEvent,
	isSafeMultiSigTransactionEvent,
	TransactionLogToTransactionPartMapper
} from 'src/libs/covalentApiDecoder/logEvents.model';
import logEventsAbi from 'src/libs/covalentApiDecoder/logEventsAbi.json';
import {
	Context,
	CovalentTransactionLogEventWithDecodedDescription,
	CovalentTransactionWithDecodedLogEvents
} from 'src/libs/covalentApiDecoder/transactions.model';
import { findTokenByAddress, getERC721Token } from 'src/libs/tokens';
import { findTokenBySymbol } from '../tokens';

const logEventsAbiInterface = new utils.Interface([...logEventsAbi]);

export const mapMaticTokenTransferLogToTransactionPart: TransactionLogToTransactionPartMapper = (
	logEventWithDescription,
	context
) => {
	const { chainId, walletAddress } = context;
	const { decoded_description: decodedDescription } = logEventWithDescription;

	if (!decodedDescription) return false;
	if (!isMaticTokenLogTransferEvent(logEventWithDescription)) return false;

	const fromAddress = getAddress(decodedDescription.args.from) || '';
	const toAddress = getAddress(decodedDescription.args.to) || '';
	const value = defaultTo<string>(decodedDescription.args.amount.toString(), '0');
	const token = findTokenByAddress({ chainId, address: getAddress(decodedDescription.args.token) || '' });

	const formattedAddress = getAddress(walletAddress);
	const isLogWalletTransfer = fromAddress === formattedAddress || toAddress === formattedAddress;

	if (token && isLogWalletTransfer && decodedDescription.args.amount.gt(0)) {
		return {
			token,
			value,
			from: {
				type: AccountType.UNKNOWN,
				address: fromAddress
			},
			to: {
				type: AccountType.UNKNOWN,
				address: toAddress
			},
			direction: fromAddress === formattedAddress ? WalletTransactionDirection.OUT : WalletTransactionDirection.IN
		};
	}

	return false;
};

export const mapErc20TokenTransferLogToTransactionPart: TransactionLogToTransactionPartMapper = (
	logEventWithDescription,
	context
) => {
	const { chainId, walletAddress } = context;
	const { decoded_description: decodedDescription } = logEventWithDescription;

	if (!decodedDescription) return false;
	if (!isErc20TokenTransferEvent(logEventWithDescription)) return false;

	const fromAddress = getAddress(decodedDescription.args.from) || '';
	const toAddress = getAddress(decodedDescription.args.to) || '';
	const value = defaultTo<string>(decodedDescription.args.value.toString(), '0');
	const token = findTokenByAddress({ chainId, address: getAddress(logEventWithDescription.sender_address) || '' });

	const formattedAddress = getAddress(walletAddress);
	const isLogWalletTransfer = fromAddress === formattedAddress || toAddress === formattedAddress;

	if (token && isLogWalletTransfer && decodedDescription.args.value.gt(0)) {
		return {
			token,
			value,
			from: {
				type: AccountType.UNKNOWN,
				address: fromAddress
			},
			to: {
				type: AccountType.UNKNOWN,
				address: toAddress
			},
			direction: fromAddress === walletAddress ? WalletTransactionDirection.OUT : WalletTransactionDirection.IN
		};
	}

	return false;
};
export const mapErc721TokenTransferLogToTransactionPart = (
	tx: CovalentTransactionWithDecodedLogEvents,
	logEventWithDescription: CovalentTransactionLogEventWithDecodedDescription,
	context: Context
): false | WalletTransactionPart => {
	const { chainId, walletAddress } = context;
	const { decoded_description: decodedDescription } = logEventWithDescription;

	if (!decodedDescription) return false;
	if (!isErc721TokenTransferEvent(logEventWithDescription)) return false;

	const fromAddress = getAddress(tx.from_address) || '';
	const toAddress = getAddress(decodedDescription.args.to) || '';
	const formattedAddress = getAddress(walletAddress);
	const isLogWalletTransfer = fromAddress === formattedAddress || toAddress === formattedAddress;
	if (!isLogWalletTransfer) {
		return false;
	}

	const tokenId = defaultTo<number>(decodedDescription.args.value.toString(), 0);
	const contractAddress = getAddress(logEventWithDescription.sender_address) || '';

	const token = getERC721Token(
		contractAddress,
		tokenId,
		chainId,
		logEventWithDescription.sender_contract_ticker_symbol
	);

	if (token && decodedDescription.args.value.gt(0)) {
		return {
			token,
			value: '',
			from: {
				type: AccountType.UNKNOWN,
				address: fromAddress
			},
			to: {
				type: AccountType.UNKNOWN,
				address: toAddress
			},
			direction: fromAddress === walletAddress ? WalletTransactionDirection.OUT : WalletTransactionDirection.IN
		};
	}

	return false;
};

export const mapBNBTokenTransferLogToTransactionPart: TransactionLogToTransactionPartMapper = (
	logEventWithDescription,
	context
) => {
	if (!isSafeMultiSigTransactionEvent(logEventWithDescription)) return false;
	const { chainId, walletAddress } = context;
	const { decoded_description: decodedDescription, sender_address } = logEventWithDescription;
	const fromAddress = getAddress(sender_address) || '';
	const toAddress = getAddress(decodedDescription.args.to) || '';
	const value = defaultTo<string>(decodedDescription.args.value.toString(), '0');
	const network = getNetworkByChainId(chainId);
	const token = findTokenBySymbol({ chainId, symbol: network?.currencySymbol! });

	const formattedAddress = getAddress(walletAddress);
	const isLogWalletTransfer = fromAddress === formattedAddress || toAddress === formattedAddress;

	if (token && isLogWalletTransfer && decodedDescription.args.value.gt(0)) {
		return {
			token,
			value,
			from: {
				type: AccountType.UNKNOWN,
				address: fromAddress
			},
			to: {
				type: AccountType.UNKNOWN,
				address: toAddress
			},
			direction: fromAddress === formattedAddress ? WalletTransactionDirection.OUT : WalletTransactionDirection.IN
		};
	}

	return false;
};

export const getLogEventForParse = (logEvent: CovalentTransactionLogEvent): { topics: string[]; data: string } => {
	const { raw_log_topics: topics, raw_log_data: data } = logEvent;
	const isERC721 = logEventsAbiInterface.getEventTopic('Transfer(address, address, uint)') === topics[0] && !data;
	return isERC721 ? { topics, data: topics[3] } : { topics, data };
};

export const decodeTransactionLogEvents = (
	logEvents: CovalentTransactionLogEvent[]
): CovalentTransactionLogEventWithDecodedDescription[] => {
	const logEventsWithDecodedDescription: CovalentTransactionLogEventWithDecodedDescription[] = logEvents
		.map((logEvent): CovalentTransactionLogEventWithDecodedDescription => {
			try {
				const logEventForParse = getLogEventForParse(logEvent);
				const logDescription = logEventsAbiInterface.parseLog(logEventForParse);
				return {
					...logEvent,
					decoded_description: logDescription
				};
			} catch (error) {
				return logEvent;
			}
		})
		.filter(
			(logEvent): logEvent is CovalentTransactionLogEventWithDecodedDescription => !!logEvent?.decoded_description
		);

	return logEventsWithDecodedDescription;
};
