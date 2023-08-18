import { useTranslation } from 'next-i18next';
import { Title1, Body, Button } from 'src/components';
import { Modal, ModalContent, ModalFooter } from 'src/components/baseModal';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: () => void;
};

const modalStyles = {
	content: { minHeight: 175, minWidth: 400 }
};

export const DeleteProposalModal = ({ isOpen, onClose, onSubmit }: Props) => {
	const { t } = useTranslation();

	return (
		<Modal isOpen={isOpen} style={modalStyles}>
			<ModalContent>
				<Title1 data-testid={'DeleteProposalModal__title'}>{t('components.dao.voting.deleteModal.heading')}</Title1>
				<Body className="mt-2" data-testid={'DeleteProposalModal__description'}>
					{t('components.dao.voting.deleteModal.description')}
				</Body>
			</ModalContent>

			<ModalFooter
				right={
					<>
						<Button size="lg" color="backgroundTertiary" label={t('actions.labels.cancel')} onClick={onClose} />
						<Button
							onClick={onSubmit}
							label={t('components.dao.voting.deleteModal.delete')}
							size="lg"
							color="accentNegative"
							data-testid={'DeleteProposalModal__deleteButton'}
						/>
					</>
				}
			/>
		</Modal>
	);
};
