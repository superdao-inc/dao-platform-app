import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import { Body, Button, Title1 } from 'src/components';
import { BaseModalProps, Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { shrinkWallet } from '@sd/superdao-shared';
import { useDeleteWalletMutation } from 'src/gql/wallet.generated';
import { NftToastContent as ToastContent } from 'src/components/toast/nftToastContent';
import { useTreasuryQuery } from 'src/gql/treasury.generated';

type Props = BaseModalProps & { id: string; address: string; slug: string; daoId: string; isWalletPage?: boolean };

const modalStyles = {
	content: {
		width: '400px',
		minWidth: '400px'
	}
};

export const RemoveWalletModal = ({ isWalletPage, isOpen, onClose, id, address, slug, daoId }: Props) => {
	const { t } = useTranslation();
	const { push } = useRouter();

	const { mutate: removeWallet } = useDeleteWalletMutation();
	const { refetch } = useTreasuryQuery({
		daoId
	});

	const handleWalletRemove = () => {
		removeWallet(
			{ deleteWalletData: { id } },
			{
				onSuccess: () => {
					onClose();
					refetch();
					isWalletPage && push(`/${slug}/treasury`, undefined, { shallow: true });
					toast.success(<ToastContent title={t('toasts.removeWallet.success.title')} />);
				},
				onError: () => {
					toast.error(
						<ToastContent
							title={t('toasts.removeWallet.failed.title')}
							description={t('toasts.removeWallet.failed.description')}
						/>
					);
				}
			}
		);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} style={modalStyles}>
			<ModalContent className="flex flex-col gap-2" data-testid={'RemoveWalletModal__wrapper'}>
				<Title1 data-testid={'RemoveWalletModal__title'}>
					{`${t('actions.labels.remove')} ${shrinkWallet(address)}?`}
				</Title1>

				<Body data-testid={'RemoveWalletModal__description'}>
					{t('components.treasury.removeWalletModal.description')}
				</Body>
			</ModalContent>

			<ModalFooter
				right={
					<>
						<Button
							size="lg"
							color="backgroundTertiary"
							label={t('actions.labels.cancel')}
							onClick={onClose}
							data-testid={'RemoveWalletModal__cancelButton'}
						/>
						<Button
							size="lg"
							color="accentNegative"
							label={t('actions.labels.remove')}
							onClick={handleWalletRemove}
							data-testid={'RemoveWalletModal__removeButton'}
						/>
					</>
				}
			/>
		</Modal>
	);
};
