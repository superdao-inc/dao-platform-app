import { useTranslation } from 'next-i18next';
import { Title1, Body } from 'src/components/text';
import { BaseModalProps, Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { Button } from 'src/components/button';
import { openExternal } from 'src/utils/urls';

export const NewAudienceModal: React.FC<BaseModalProps> = (props) => {
	const { isOpen, onClose } = props;
	const { t } = useTranslation();

	const onContactUs = () => openExternal('https://t.me/explain_plz');
	const modalStyles = { content: { maxWidth: 400, minWidth: 400 } };

	return (
		<Modal isOpen={isOpen} onClose={onClose} style={modalStyles}>
			<ModalContent>
				<Title1 className="mb-2 block">{t('modals.addNewAudience.title')}</Title1>
				<Body className="text-foregroundSecondary">{t('modals.addNewAudience.content')}</Body>
			</ModalContent>

			<ModalFooter
				right={
					<>
						<Button size="lg" color="transparent" label={t('actions.labels.cancel')} onClick={onClose} />
						<Button
							size="lg"
							color="accentPrimary"
							label={t('modals.addNewAudience.actions.contact')}
							onClick={onContactUs}
						/>
					</>
				}
			/>
		</Modal>
	);
};
