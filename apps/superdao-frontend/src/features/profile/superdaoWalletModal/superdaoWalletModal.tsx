import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import copy from 'clipboard-copy';

import {
	Body,
	CopyIcon,
	Input,
	NoLimitationIcon,
	RepeatIcon,
	SecurityIcon,
	Title1,
	Title4,
	toast
} from 'src/components';
import { Modal, ModalContent } from 'src/components/baseModal';

type Props = {
	walletAddress: string;
	onClose: () => void;
	isOpen: boolean;
};

const MODAL_STYLES = {
	content: {
		width: 400,
		minWidth: 400
	}
};

export const SuperdaoWalletModal = (props: Props) => {
	const { walletAddress, onClose, isOpen } = props;

	const { t } = useTranslation();

	const copyWalletToClipboard = () => {
		copy(walletAddress).then(() => toast.success(t('modals.superdaoWallet.toast'), { position: 'bottom-center' }));
	};

	const blocks = [
		{
			icon: <NoLimitationIcon className="shrink-0" />,
			title: t('modals.superdaoWallet.blocks.limitation.title'),
			text: t('modals.superdaoWallet.blocks.limitation.text')
		},
		{
			icon: <SecurityIcon className="shrink-0" />,
			title: t('modals.superdaoWallet.blocks.security.title'),
			text: t('modals.superdaoWallet.blocks.security.text')
		},
		{
			icon: <RepeatIcon className="shrink-0" />,
			title: t('modals.superdaoWallet.blocks.compatibility.title'),
			text: t('modals.superdaoWallet.blocks.compatibility.text')
		}
	];

	return (
		<Modal isOpen={isOpen} withCloseIcon onClose={onClose} style={MODAL_STYLES}>
			<ModalContent withFooter={false} className="py-6">
				<div className="mx-auto mt-6 w-max">
					<Image src="/assets/arts/walletArt.svg" alt="wallet-art" width={220} height={138} />
				</div>

				<Title1 className="mt-7">{t('modals.superdaoWallet.title')}</Title1>
				<Body className="text-foregroundSecondary mt-2">{t('modals.superdaoWallet.description')}</Body>
				<div className="mt-3 cursor-pointer" onClick={copyWalletToClipboard}>
					<Input
						className="text-foregroundSecondary pointer-events-none truncate"
						rightIcon={<CopyIcon width={24} height={24} />}
						value={walletAddress}
						readOnly
					/>
				</div>
				<div className="mt-6 flex flex-wrap gap-4">
					{blocks.map((block) => (
						<div className="flex w-full items-center gap-4" key={block.title}>
							{block.icon}
							<div>
								<Title4 className="text-foregroundSecondary">{block.title}</Title4>
								<Body className="text-foregroundSecondary mt-1/2 whitespace-pre-line">{block.text}</Body>
							</div>
						</div>
					))}
				</div>
			</ModalContent>
		</Modal>
	);
};
