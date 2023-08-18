import { useTranslation } from 'next-i18next';

import { Body, Button, Title1 } from 'src/components';
import { Modal, ModalContent, ModalFooter } from 'src/components/baseModal';

import { modalStyles } from './utils';

type Props = {
	onClose: () => void;
	isOpen?: boolean;
};

export const UnknownErrorModal = (props: Props) => {
	const { onClose, isOpen = true } = props;
	const { t } = useTranslation();

	return (
		<Modal style={modalStyles} isOpen={isOpen}>
			<ModalContent>
				<Title1>{t('pages.claim.modal.unknownError.heading')}</Title1>
				<Body className="text-foregroundSecondary mt-2">{t('pages.claim.modal.unknownError.description')}</Body>
			</ModalContent>

			<ModalFooter
				right={
					<Button onClick={onClose} label={t('pages.claim.modal.unknownError.back')} size="lg" color="accentPrimary" />
				}
			/>
		</Modal>
	);
};
