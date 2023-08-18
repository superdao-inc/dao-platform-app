import { useTranslation } from 'next-i18next';
import { Title1, Body, Button } from 'src/components';
import { Modal, ModalContent, ModalFooter } from 'src/components/baseModal';

type Props = {
	isOpen: boolean;
	onCancel: () => void;
	onExit: () => void;
};

const modalStyles = {
	content: { minHeight: 175, minWidth: 400 }
};

export const ExitProposalSettingsModal = ({ isOpen, onCancel, onExit }: Props) => {
	const { t } = useTranslation();

	return (
		<Modal isOpen={isOpen} style={modalStyles}>
			<ModalContent data-testid={'QuitCreateProposalModal__wrapper'}>
				<Title1 data-testid={'QuitCreateProposalModal__title'}>
					{t('components.dao.voting.exitSettingsModal.heading')}
				</Title1>
				<Body className="mt-2" data-testid={'QuitCreateProposalModal__description'}>
					{t('components.dao.voting.exitSettingsModal.description')}
				</Body>
			</ModalContent>

			<ModalFooter
				right={
					<>
						<Button
							size="lg"
							color="backgroundTertiary"
							label={t('actions.labels.cancel')}
							onClick={onCancel}
							data-testid={'QuitCreateProposalModal__cancelButton'}
						/>
						<Button
							onClick={onExit}
							label={t('actions.labels.exit')}
							size="lg"
							color="accentNegative"
							data-testid={'QuitCreateProposalModal__exitButton'}
						/>
					</>
				}
			/>
		</Modal>
	);
};
