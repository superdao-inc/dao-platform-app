import { useTranslation } from 'next-i18next';

import { GroupIcon } from 'src/components/assets/icons';
import { WalletTransactionPart } from 'src/types/types.generated';

import { TransferPart } from './transferPart';

type Props = {
	parts: WalletTransactionPart[];
};

export const DirectionTransferParts = ({ parts }: Props) => {
	const { t } = useTranslation();

	if (parts.length === 1) {
		return (
			<div key={parts[0].token.address} className="flex">
				<TransferPart part={parts[0]} />
			</div>
		);
	}

	if (parts.length > 0) {
		return (
			<div className="flex items-center">
				<div className="bg-overlayTertiary flex h-6 w-6 items-center justify-center rounded-full">
					<GroupIcon />
				</div>

				<div className="ml-2 capitalize">
					{parts.length} {t('components.treasury.assets_other')}
				</div>
			</div>
		);
	}

	return null;
};
