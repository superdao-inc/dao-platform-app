import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { Body, Button, Title1 } from 'src/components';
import { BaseModalProps, Modal, ModalContent, ModalFooter } from 'src/components/baseModal';

type Props = BaseModalProps;

const modalStyles = {
	content: {
		width: '400px',
		minWidth: '400px'
	}
};

export const WelcomeToBetaModal = (props: Props) => {
	const { isOpen, onClose } = props;

	const { t } = useTranslation();
	const { push } = useRouter();

	const handleRedirectToDaoCreation = () => push('/daos/create');

	return (
		<Modal isOpen={isOpen} onClose={onClose} style={modalStyles}>
			<ModalContent className="flex flex-col gap-2">
				<Title1>{t('components.welcomeToBetaModal.title')}</Title1>

				<Body>{t('components.welcomeToBetaModal.description')}</Body>
			</ModalContent>

			<ModalFooter
				right={
					<Button
						size="lg"
						color="accentPrimary"
						label={t('components.welcomeToBetaModal.button')}
						onClick={handleRedirectToDaoCreation}
					/>
				}
			/>
		</Modal>
	);
};
