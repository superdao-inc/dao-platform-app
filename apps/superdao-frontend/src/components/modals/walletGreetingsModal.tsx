import { useTranslation } from 'next-i18next';

import { Body, Title1 } from 'src/components/text';
import { BaseModalProps, Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { MagicIcon } from 'src/components/assets/icons';
import { Button } from 'src/components/button';

type Props = BaseModalProps;

const modalStyles = {
	content: {
		width: '400px',
		minWidth: '400px'
	}
};

export const WalletGreetingsModal = (props: Props) => {
	const { isOpen, onClose } = props;

	const { t } = useTranslation();

	return (
		<Modal isOpen={isOpen} onClose={onClose} style={modalStyles}>
			<ModalContent>
				<div className="flex flex-row gap-2">
					<Title1>{t('components.walletGreetings.title')}</Title1>
					<MagicIcon width={30} height={30} />
				</div>

				<Body className="mt-2 mb-7">{t('components.walletGreetings.description')}</Body>

				<img className="m-auto" src="/assets/treasury.svg" width={267} />
			</ModalContent>
			<ModalFooter
				right={
					<Button size="lg" color="accentPrimary" label={t('components.walletGreetings.button')} onClick={onClose} />
				}
			/>
		</Modal>
	);
};
