import { useTranslation } from 'next-i18next';

import { ExternalLinkIcon, MagicIcon } from '../assets/icons';
import { Button } from '../button';
import { Body, Title1 } from 'src/components/text';
import { BaseModalProps, Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { openExternal } from 'src/utils/urls';
import { snapshotStrategiesGuide } from 'src/constants';

type Props = BaseModalProps;

const modalStyles = {
	content: {
		width: '400px',
		minWidth: '400px'
	}
};

export const DaoSnapshotIntegratedModal = (props: Props) => {
	const { isOpen, onClose } = props;

	const { t } = useTranslation();

	const handleShowStrategies = () => openExternal(snapshotStrategiesGuide);

	return (
		<Modal isOpen={isOpen} onClose={onClose} style={modalStyles}>
			<ModalContent>
				<div className="flex flex-row gap-2">
					<Title1>{t('components.dao.voting.modal.title')}</Title1>
					<MagicIcon width={30} height={30} />
				</div>

				<Body className="mt-2">{t('components.dao.voting.modal.description')}</Body>

				<a
					className="b mt-4 flex w-full cursor-pointer items-center gap-3 rounded-lg py-2 hover:text-white"
					onClick={handleShowStrategies}
				>
					<ExternalLinkIcon width={20} height={20} />

					<span className="flex-1">
						<Body>{t('components.dao.voting.modal.strategies')}</Body>
					</span>
				</a>
			</ModalContent>
			<ModalFooter
				right={<Button size="lg" color="accentPrimary" label={t('components.daoGreetings.button')} onClick={onClose} />}
			/>
		</Modal>
	);
};
