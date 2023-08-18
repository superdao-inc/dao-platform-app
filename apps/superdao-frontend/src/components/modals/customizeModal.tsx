import { useTranslation } from 'next-i18next';

import { Body, Title1 } from 'src/components/text';
import { BaseModalProps, Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { Button } from 'src/components/button';
import { openExternal } from 'src/utils/urls';

type Props = BaseModalProps;

const modalStyles = {
	content: {
		width: '400px',
		minWidth: '400px'
	}
};

export const CustomizeModal = (props: Props) => {
	const { isOpen, onClose } = props;

	const { t } = useTranslation();

	const handleBtnClick = () => openExternal('https://forms.superdao.co/customize');

	return (
		<Modal isOpen={isOpen} onClose={onClose} style={modalStyles}>
			<ModalContent>
				<Title1 className="mb-2">{t('modals.customize.title')}</Title1>

				<Body className="text-foregroundSecondary max-w-80">{t('modals.customize.desc')}</Body>
			</ModalContent>
			<ModalFooter
				right={
					<>
						<Button size="lg" color="backgroundTertiary" label={t('actions.labels.cancel')} onClick={onClose} />
						<Button size="lg" color="accentPrimary" label={t('modals.customize.btnContact')} onClick={handleBtnClick} />
					</>
				}
			/>
		</Modal>
	);
};
