import Blockies from 'react-blockies';
import { useTranslation } from 'next-i18next';

import { InfoIcon, Label1, Label2, SubHeading } from 'src/components';
import { colors } from 'src/style';
import Tooltip from 'src/components/tooltip';
import { TreasuryWalletType } from 'src/types/types.generated';
import { getWalletTransactionTypeTranslationKey } from 'src/utils/treasuryWallet';

type Props = {
	name: string;
	address: string;
	type?: TreasuryWalletType;
};

export const WalletInfo = ({ name, address, type }: Props) => {
	const { t } = useTranslation();
	const typeTranslationKey = type ? getWalletTransactionTypeTranslationKey(type) : '';

	return (
		<div className="flex items-center">
			<Blockies className="before mr-4 cursor-pointer  rounded-full" size={10} seed={address || ''} />

			<div>
				<Label1 color={colors.foregroundPrimary}> {name} </Label1>

				<SubHeading color={colors.foregroundSecondary}>{address}</SubHeading>

				{type && (
					<SubHeading className="flex items-center" color={colors.foregroundTertiary}>
						<span className="mr-1">{t(typeTranslationKey)}</span>

						<Tooltip
							placement="bottom"
							content={
								<div className="max-w-[200px] whitespace-normal">
									<Label2>{t(typeTranslationKey)}</Label2>
									<SubHeading>{t(`components.treasury.transferFundsModal.tooltipByWalletTypeInfo.safe`)}</SubHeading>
								</div>
							}
						>
							<InfoIcon />
						</Tooltip>
					</SubHeading>
				)}
			</div>
		</div>
	);
};
