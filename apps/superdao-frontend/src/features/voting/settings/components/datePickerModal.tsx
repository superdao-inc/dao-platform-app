import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { Title1, Button, CustomDatepicker } from 'src/components';
import { Modal, ModalContent, ModalFooter } from 'src/components/baseModal';

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onChange: (date: Date, mode: DatepickerMode) => void;
	mode: DatepickerMode;
	minimumDate?: Date;
};

export enum DatepickerMode {
	Start = 'Start',
	End = 'End'
}

const modalStyles = {
	content: { minHeight: 470, minWidth: 350 }
};

export const DatePickerModal = ({ isOpen, onClose, onChange, mode, minimumDate }: Props) => {
	const { t } = useTranslation();

	const translationKey = mode === DatepickerMode.Start ? 'start' : 'end';

	const [date, setDate] = useState(new Date());

	const handleChangeDate = (newDate: Date) => setDate(newDate);
	const handleSubmit = () => {
		onChange(date, mode);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} style={modalStyles} withCloseIcon onClose={onClose}>
			<ModalContent withFooter={false} data-testid={'DatePicker__modal'}>
				<Title1 className="mb-3">{t(`components.dao.voting.edition.modal.${translationKey}.heading`)}</Title1>
				<CustomDatepicker selected={date} onChange={handleChangeDate} minDate={minimumDate} />
			</ModalContent>

			<ModalFooter
				right={
					<Button
						onClick={handleSubmit}
						label={t(`actions.labels.set`)}
						size="lg"
						color="accentPrimary"
						data-testid={'DatePicker__setButton'}
					/>
				}
			/>
		</Modal>
	);
};
