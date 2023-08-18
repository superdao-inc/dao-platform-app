import { useTranslation } from 'next-i18next';
import { Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { Body, Button, Title1 } from 'src/components';

import { modalStyles } from './utils';

type Props = {
	onBack: () => void;
	onAction: () => void;
};

export const NotInWhitelistModal = (props: Props) => {
	const { onBack, onAction } = props;
	const { t } = useTranslation();

	return (
		<Modal style={modalStyles} isOpen>
			<ModalContent>
				<Title1>{t('pages.claim.modal.notInWhitelist.heading')}</Title1>
				<Body className="text-foregroundSecondary mt-2">{t('pages.claim.modal.notInWhitelist.description')}</Body>
			</ModalContent>

			<ModalFooter
				left={
					<Button
						onClick={onBack}
						label={t('pages.claim.modal.notInWhitelist.back')}
						size="lg"
						color="backgroundTertiary"
					/>
				}
				right={
					<Button
						onClick={onAction}
						label={t('pages.claim.modal.notInWhitelist.action')}
						size="lg"
						color="accentPrimary"
					/>
				}
			/>
		</Modal>
	);
};
