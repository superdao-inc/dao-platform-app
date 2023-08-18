import React, { FC } from 'react';
import { Modal } from 'src/components/baseModal';

export const modalStyles = {
	content: { minHeight: 175, minWidth: 270, maxWidth: 400 }
};

type Props = {
	isOpen: boolean;
	children?: React.ReactNode;
};

export const ValidationModal: FC<Props> = (props) => {
	const { isOpen, children } = props;

	return (
		<Modal style={modalStyles} isOpen={isOpen}>
			{children}
		</Modal>
	);
};
