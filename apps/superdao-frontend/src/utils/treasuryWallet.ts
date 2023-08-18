import { TreasuryWalletType } from 'src/types/types.generated';

type TreasuryTranslationKey = 'treasuryWallet.type.EXTERNAL' | 'treasuryWallet.type.SAFE';

export const getWalletTransactionTypeTranslationKey = (type: TreasuryWalletType): TreasuryTranslationKey => {
	const translationByType: Record<TreasuryWalletType, TreasuryTranslationKey> = {
		[TreasuryWalletType.External]: 'treasuryWallet.type.EXTERNAL',
		[TreasuryWalletType.Safe]: 'treasuryWallet.type.SAFE'
	};

	return translationByType[type];
};
