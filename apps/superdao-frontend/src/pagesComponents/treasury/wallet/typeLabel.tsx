import React from 'react';
import { useTranslation } from 'next-i18next';

import { Caption } from 'src/components/text';
import { SvgProps } from 'src/components/assets/svg';
import { Label1, WalletFilledIcon, WalletGnosisSafeIcon, Button, ExternalLinkIcon } from 'src/components';
import { TreasuryWalletType } from 'src/types/types.generated';
import { getWalletTransactionTypeTranslationKey } from 'src/utils/treasuryWallet';
import { getSafeAppUrl, openExternal } from 'src/utils/urls';
import { colors } from 'src/style';

type Props = {
	address: string;
	type: TreasuryWalletType;
	chainId: number | null;
};

const chains: {
	[key in number]: string;
} = {
	137: 'matic',
	1: 'eth',
	56: 'bnb'
};

type IconElement = React.ElementType<SvgProps>;

const typeIconMap: Record<TreasuryWalletType, IconElement> = {
	[TreasuryWalletType.External]: WalletFilledIcon,
	[TreasuryWalletType.Safe]: WalletGnosisSafeIcon
};

export const WalletTypeComponent = ({ type, address, chainId }: Props) => {
	const { t } = useTranslation();

	const typeTranslationKey = getWalletTransactionTypeTranslationKey(type);
	const Icon = typeIconMap[type];

	const handleOpenSafeApp = () => openExternal(getSafeAppUrl(address, chainId ? chains[chainId] : 'matic'));

	if (type === TreasuryWalletType.Safe) {
		return (
			<Button
				className="max-h-8"
				leftIcon={<WalletGnosisSafeIcon height={16} width={16} fill={colors.foregroundSecondary} />}
				rightIcon={<ExternalLinkIcon />}
				color="backgroundTertiary"
				size="md"
				label={t(typeTranslationKey)}
				onClick={handleOpenSafeApp}
			/>
		);
	}

	return (
		<Caption className="bg-backgroundTertiary flex max-h-8 items-center justify-around gap-2 rounded-lg px-4 py-1.5">
			<Icon height={16} width={16} fill={colors.foregroundSecondary} />
			<Label1>{t(typeTranslationKey)}</Label1>
		</Caption>
	);
};
