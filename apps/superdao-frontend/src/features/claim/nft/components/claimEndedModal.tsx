import { useTranslation } from 'next-i18next';

import { Body, Button, Title1 } from 'src/components';
import { Modal, ModalContent, ModalFooter } from 'src/components/baseModal';

import { modalStyles } from './utils';

type Props = {
	onRedirect: () => void;
};

export const ClaimEndedModal = (props: Props) => {
	const { onRedirect } = props;
	const { t } = useTranslation();

	return (
		<Modal style={modalStyles} isOpen>
			<ModalContent>
				<Title1>{t('pages.claim.modal.claimEnded.heading')}</Title1>
				<Body className="text-foregroundSecondary mt-2">{t('pages.claim.modal.claimEnded.description')}</Body>
			</ModalContent>

			<ModalFooter
				right={
					<Button onClick={onRedirect} label={t('pages.claim.modal.claimEnded.back')} size="lg" color="accentPrimary" />
				}
			/>
		</Modal>
	);
};
