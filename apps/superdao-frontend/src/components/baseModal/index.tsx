import { ReactNode, useMemo } from 'react';
import ReactModal from 'react-modal';
import { CrossIcon } from '../assets/icons/cross';
import { colors } from 'src/style';

type Props = ReactModal.Props & {
	isOpen: boolean;
	children: ReactNode;
	onClose?: () => void;
	withCloseIcon?: boolean;
};

export const defaultModalStyle = {
	content: {
		top: '50%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		minWidth: 'min(560px, 100vw - 32px)',
		minHeight: 200,
		maxHeight: 'calc(100vh - 40px)',
		padding: 0,
		border: 'unset',
		borderRadius: '12px',
		transform: 'translate(-50%, -50%)',
		boxShadow: '0px 8px 48px rgba(0, 0, 0, 0.16), 0px 0px 96px rgba(0, 0, 0, 0.08)',
		background: colors.backgroundSecondary
	},
	overlay: {
		inset: '0',
		background: colors.overlayHeavy
	}
};

export const modalCloseTimeoutMS = 200;
export const modalZIndex = 20;

const Modal = (props: Props) => {
	const { style = {}, onClose, withCloseIcon, children } = props;

	const iconWrapperClass =
		'hover:bg-overlaySecondary absolute top-4 right-4 z-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-[50%]';

	const modalStyle = useMemo(
		() => ({
			content: {
				...defaultModalStyle.content,
				...(style.content || {})
			},
			overlay: {
				...defaultModalStyle.overlay,
				...(style.overlay || {}),
				zIndex: modalZIndex
			}
		}),
		[style]
	);

	return (
		<ReactModal
			{...props}
			style={modalStyle}
			onRequestClose={onClose}
			ariaHideApp={false}
			closeTimeoutMS={modalCloseTimeoutMS}
		>
			{children}
			{onClose && withCloseIcon && (
				<div className={iconWrapperClass} onClick={onClose} data-testid="Modal__closeButton">
					<CrossIcon width={20} height={20} className="fill-foregroundTertiary" />
				</div>
			)}
		</ReactModal>
	);
};

export { Modal };
export * from './types';
export * from './content';
export * from './footer';
