import { useTranslation } from 'next-i18next';
import copy from 'clipboard-copy';
import { QRCodeCanvas } from 'qrcode.react';
import { useRef } from 'react';

import { BaseModalProps, Modal, ModalContent } from 'src/components/baseModal';

import { CopyIcon, DownloadIcon, LinkIcon } from '../assets/icons';
import { Input } from '../input';
import { Body, Title1 } from '../text';
import { IconButton } from '../button';
import { useDismissibleToast } from '../toast';

const modalStyles = {
	content: {
		minWidth: 350,
		maxWidth: 400,
		minHeight: 150,
		overflow: 'visible'
	}
};

type Props = BaseModalProps & {
	daoUrl: string;
	daoWalletAddress?: string;
};

export const TreasurySharingModal = (props: Props) => {
	const { isOpen, onClose, daoUrl, daoWalletAddress } = props;
	const qrContainerRef = useRef<HTMLDivElement>(null);

	const { t } = useTranslation();

	const linkCopiedToast = useDismissibleToast(t('actions.confirmations.linkCopy'));
	const addressCopiedToast = useDismissibleToast(t('actions.confirmations.addressCopy'));

	const handleCopyLink = (url: string, showToast: () => void) => {
		try {
			navigator.share({ url });
		} catch {
			copy(url ?? '').then(() => showToast());
		}
	};

	const handleDownloadQr = () => {
		const canvas = qrContainerRef.current?.childNodes[0] as HTMLCanvasElement;
		if (!canvas) return;
		const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');

		const downloadLink = document.createElement('a');
		downloadLink.href = pngUrl;
		downloadLink.download = `main-wallet-${daoWalletAddress}.png`;
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	};

	return (
		<Modal isOpen={isOpen} withCloseIcon onClose={onClose} style={modalStyles}>
			<ModalContent withFooter={false} className="mb-0 pb-6" data-testid={'SharingModal__wrapper'}>
				<Title1 className="w-full" data-testid={'SharingModal__title'}>
					{t('components.treasury.shareTreasuryModal.title')}
				</Title1>
				{daoWalletAddress && (
					<Body className="mt-2 w-full" data-testid={'SharingModal__description'}>
						{t('components.treasury.shareTreasuryModal.description')}
					</Body>
				)}

				{daoWalletAddress && (
					<>
						<div className="bg-backgroundTertiary relative mt-5 flex justify-center rounded-xl px-24 py-8">
							<div
								ref={qrContainerRef}
								className="w-auto rounded-xl border-8 border-white"
								data-testid={'SharingModal__qrCode'}
							>
								<QRCodeCanvas value={daoWalletAddress} />
							</div>
							<IconButton
								icon={<DownloadIcon />}
								size="md"
								color="backgroundTertiary"
								className="absolute right-4 bottom-4"
								onClick={handleDownloadQr}
							/>
						</div>
						<div className="mt-6">
							<Input
								label="Wallet address"
								readOnly
								value={daoWalletAddress}
								leftIcon={<LinkIcon width={20} height={20} />}
								rightIcon={
									<CopyIcon
										onClick={() => handleCopyLink(daoWalletAddress, addressCopiedToast.show)}
										className="text-accentPrimary cursor-pointer"
									/>
								}
								data-testid={'SharingModal__walletAddressInput'}
							/>
						</div>
					</>
				)}
				<div className="mt-6">
					<Input
						label="Share link"
						readOnly
						value={daoUrl}
						leftIcon={<LinkIcon width={20} height={20} />}
						rightIcon={
							<CopyIcon
								onClick={() => handleCopyLink(daoUrl, linkCopiedToast.show)}
								className="text-accentPrimary cursor-pointer"
							/>
						}
						data-testid={'SharingModal__shareLink'}
					/>
				</div>
			</ModalContent>
		</Modal>
	);
};
