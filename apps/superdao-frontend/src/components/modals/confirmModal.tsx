import { useTranslation } from 'next-i18next';
import _merge from 'lodash/merge';
import { useMemo } from 'react';
import { Title1, Body } from 'src/components/text';
import { BaseModalProps, Modal, ModalContent, ModalFooter } from 'src/components/baseModal';
import { Button } from 'src/components/button';

export type Props = BaseModalProps & {
	title: string;
	text: React.ReactNode;
	rightContent: React.ReactNode;
	modalStyle?: ReactModal.Styles;
	isShowCancelBtn?: boolean;
};

export const ConfirmModal: React.FC<Props> = (props) => {
	const { isOpen, onClose, text, title, rightContent, modalStyle, isShowCancelBtn = true } = props;
	const { t } = useTranslation();

	const style = useMemo(() => _merge({ content: { minWidth: 400 } }, modalStyle), [modalStyle]);

	return (
		<Modal isOpen={isOpen} onClose={onClose} style={style}>
			<ModalContent>
				<Title1 className="mb-2 block">{title}</Title1>
				<Body className="text-foregroundSecondary">{text}</Body>
			</ModalContent>

			<ModalFooter
				right={
					<>
						{isShowCancelBtn && (
							<Button size="lg" color="backgroundTertiary" label={t('actions.labels.cancel')} onClick={onClose} />
						)}
						{rightContent}
					</>
				}
			/>
		</Modal>
	);
};
