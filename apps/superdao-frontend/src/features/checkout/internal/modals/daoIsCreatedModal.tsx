import { useTranslation } from 'next-i18next';

import { Body, Button, MagicIcon, Title1 } from 'src/components';
import { Modal, ModalContent, ModalFooter } from 'src/components/baseModal';

type Props = {
	onButtonClick: () => void;
	isOpen: boolean;
};

const modalStyles = {
	content: { minHeight: 175, minWidth: 270, maxWidth: 400 }
};

export const DaoIsCreatedModal = (props: Props) => {
	const { onButtonClick, isOpen } = props;
	const { t } = useTranslation();

	return (
		<Modal style={modalStyles} isOpen={isOpen}>
			<ModalContent>
				<Title1 className="flex">
					{t('modals.daoPassSuccess.title')} <MagicIcon className="ml-2" />
				</Title1>
				<Body className="mt-2 ">{t('modals.daoPassSuccess.content')}</Body>
			</ModalContent>
			<ModalFooter
				right={
					<Button onClick={onButtonClick} label={t('modals.daoPassSuccess.enter')} size="lg" color="accentPrimary" />
				}
			/>
		</Modal>
	);
};
