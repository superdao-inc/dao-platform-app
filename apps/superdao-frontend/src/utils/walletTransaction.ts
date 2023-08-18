import { WalletTransactionType } from 'src/types/types.generated';

type WalletTransactionTranslationKey =
	| 'walletTransaction.type.RECEIVE'
	| 'walletTransaction.type.SEND'
	| 'walletTransaction.type.EXECUTION'
	| 'walletTransaction.type.SELL'
	| 'walletTransaction.type.SAFE_SETUP'
	| 'walletTransaction.type.RECEIVE_NFT'
	| 'walletTransaction.type.SEND_NFT';

export const getWalletTransactionTypeTranslationKey = (
	type: WalletTransactionType
): WalletTransactionTranslationKey => {
	const translationByType: Record<WalletTransactionType, WalletTransactionTranslationKey> = {
		[WalletTransactionType.Receive]: 'walletTransaction.type.RECEIVE',
		[WalletTransactionType.ReceiveNft]: 'walletTransaction.type.RECEIVE_NFT',
		[WalletTransactionType.Send]: 'walletTransaction.type.SEND',
		[WalletTransactionType.SendNft]: 'walletTransaction.type.SEND_NFT',
		[WalletTransactionType.Execution]: 'walletTransaction.type.EXECUTION',
		[WalletTransactionType.Sell]: 'walletTransaction.type.SELL',
		[WalletTransactionType.SafeSetup]: 'walletTransaction.type.SAFE_SETUP'
	};

	return translationByType[type];
};
