import { TFunction } from 'next-i18next';
import { FormType } from 'src/pagesComponents/dao/nftSelect';

type Props = {
	formType: FormType;
	selectedTiersWalletsSize: number;
	t: TFunction;
};

export const getImportTitles = ({ formType, t, selectedTiersWalletsSize }: Props) => {
	switch (formType) {
		case FormType.airdrop: {
			const buttonText = selectedTiersWalletsSize
				? t('pages.importMembers.send', { count: selectedTiersWalletsSize })
				: t('pages.importMembers.sendZero');

			return {
				buttonText,
				headingTitle: t('pages.importMembers.airdropHeading'),
				nftTierHeading: t('pages.importMembers.tiers.assignAnNftTierHeading')
			};
		}
		case FormType.whitelist: {
			const buttonText = selectedTiersWalletsSize
				? t('pages.importMembers.addWallets', { count: selectedTiersWalletsSize })
				: t('pages.importMembers.addWalletsZero');

			return {
				buttonText,
				headingTitle: t('pages.importMembers.whitelistHeading'),
				nftTierHeading: t('pages.importMembers.tiers.assignAnNftTierHeading')
			};
		}
		default:
			return {};
	}
};
