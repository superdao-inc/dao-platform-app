import { useTranslation } from 'next-i18next';

import { BaseModalProps, Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { Button } from 'src/components/button';
import { Body, Title1 } from 'src/components/text';
import { openExternal } from 'src/utils/urls';

const modalStyles = {
	content: {
		width: 410,
		minWidth: 400,
		minHeight: 195
	}
};

type Props = BaseModalProps & {};

export const DaoLimitModal = (props: Props) => {
	const { isOpen, onClose } = props;

	const { t } = useTranslation();

	const onRequestButtonClick = () => openExternal(`https://t.me/superdao_team`);

	return (
		<Modal isOpen={isOpen} onClose={onClose} style={modalStyles}>
			<ModalContent>
				<Title1>{t('modals.daoLimit.title')}</Title1>
				<Body className="mt-2">{t('modals.daoLimit.content')}</Body>
			</ModalContent>

			<ModalFooter
				right={
					<>
						<Button size="lg" color="backgroundTertiary" label={t('actions.labels.cancel')} onClick={onClose} />
						<Button
							size="lg"
							color="accentPrimary"
							label={t('modals.daoLimit.actions.support')}
							onClick={onRequestButtonClick}
						/>
					</>
				}
			/>
		</Modal>
	);
};
