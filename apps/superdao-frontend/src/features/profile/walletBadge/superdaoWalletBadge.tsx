import { useTranslation } from 'next-i18next';

import clipboardCopy from 'clipboard-copy';
import { shrinkLargeWallet } from '@sd/superdao-shared';

import { ChevronIcon, Label2, LogoIcon, toast, WalletIcon } from 'src/components';
import { UserWalletType } from 'src/types/types.generated';
import { useSwitch } from 'src/hooks';

import { SuperdaoWalletModal } from '../superdaoWalletModal/superdaoWalletModal';
import Tooltip from 'src/components/tooltip';
import { TooltipContent } from 'src/components/navigation/tooltipContent';

type Props = {
	walletType: UserWalletType;
	walletAddress: string;
};

export const SuperdaoWalletBadge = (props: Props) => {
	const { walletType, walletAddress } = props;

	const { t } = useTranslation();

	const [isModalVisible, { on: showModal, off: hideModal }] = useSwitch(false);

	const copyWallet = () => {
		clipboardCopy(walletAddress).then(() => {
			toast.success(t('actions.confirmations.addressCopy'), { position: 'bottom-center' });
		});
	};

	const walletWrapperClassName =
		'bg-overlaySecondary hover:bg-overlayTertiary flex w-max cursor-pointer items-center gap-2 rounded-[100px] py-1.5 px-3 transition-all';

	const isWalletGenerated = walletType === UserWalletType.MagicLink;

	if (isWalletGenerated) {
		return (
			<div className="w-max">
				<div className={walletWrapperClassName} onClick={showModal}>
					<LogoIcon />
					<Label2>{t('components.superdaoWalletBadge.generated')}</Label2>
					<ChevronIcon />
				</div>
				<SuperdaoWalletModal isOpen={isModalVisible} walletAddress={walletAddress} onClose={hideModal} />
			</div>
		);
	}

	return (
		<div className="w-max">
			<Tooltip content={<TooltipContent title={t('actions.labels.clickToCopy')} />} placement="bottom">
				<div className={walletWrapperClassName} onClick={copyWallet}>
					<WalletIcon />
					<Label2>{shrinkLargeWallet(walletAddress)}</Label2>
				</div>
			</Tooltip>
		</div>
	);
};
