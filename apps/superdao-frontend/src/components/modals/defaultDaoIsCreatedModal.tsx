import { useTranslation } from 'next-i18next';
import { ChangeEvent, useState } from 'react';
import { SLUG_MIN_LENGTH } from '@sd/superdao-shared';

import { Body, Button, Title1, Input } from 'src/components';
import { BaseModalProps, Modal, ModalContent, ModalFooter } from 'src/components/baseModal';

type Props = BaseModalProps & { onSave: (daoName: string) => void };

const modalStyles = {
	content: {
		width: '400px',
		minWidth: '400px'
	}
};

export const DefaultDaoIsCreatedModal = ({ isOpen, onClose, onSave }: Props) => {
	const { t } = useTranslation();

	const [daoName, setDaoName] = useState('');

	const handleSave = () => {
		onSave(daoName);
	};

	const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
		setDaoName(e.target.value);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} style={modalStyles}>
			<ModalContent>
				<Title1>{t('components.dao.daoCreated.modal.title')}</Title1>
				<Body className="mt-2 mb-4">{t('components.dao.daoCreated.modal.description')}</Body>
				<div className={daoName.trim().length && daoName.trim().length < SLUG_MIN_LENGTH ? 'mb-8' : undefined}>
					<Input
						placeholder={t('components.dao.daoCreated.modal.placeholder')}
						value={daoName}
						onChange={handleNameChange}
						error={
							daoName.trim().length && daoName.trim().length < SLUG_MIN_LENGTH
								? t('components.dao.daoCreated.modal.validationError', { count: SLUG_MIN_LENGTH })
								: undefined
						}
					/>
				</div>
			</ModalContent>

			<ModalFooter
				right={
					<>
						<Button size="lg" color="transparent" label={t('actions.labels.skip')} onClick={onClose} />
						<Button
							size="lg"
							color="accentPrimary"
							label={t('actions.labels.save')}
							onClick={handleSave}
							disabled={!daoName.trim() || daoName.trim().length < SLUG_MIN_LENGTH}
						/>
					</>
				}
			/>
		</Modal>
	);
};
