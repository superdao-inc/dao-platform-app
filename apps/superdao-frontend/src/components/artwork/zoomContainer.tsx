import { useCallback, ReactElement } from 'react';
import cn from 'classnames';
import { ZoomInIcon } from 'src/components/assets/icons/zoomIn';
import { useToggle } from 'src/hooks';
import { Modal } from 'src/components/baseModal';
import { ZoomOutIcon } from 'src/components/assets/icons/zoomOut';
import { colors } from 'src/style';
import { ControlContainer } from './controlContainer';

type ZoomContainerComponentProps = {
	children: ReactElement;
	toZoomChildren: ReactElement;
	isZoomEnabled?: boolean;
	className?: string;
	zoomControlClassName?: string;
};

const modalStyles = {
	content: {
		width: '100vw',
		height: '100vh',
		maxHeight: '100vh',
		boxShadow: 'none',
		background: 'transparent'
	}
};

export const ZoomContainer = ({
	children,
	isZoomEnabled,
	toZoomChildren,
	className,
	zoomControlClassName
}: ZoomContainerComponentProps) => {
	const [isOpen, toggleModal] = useToggle(false);

	const handleToggleModal = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			e.preventDefault();

			if (!isZoomEnabled) return;

			toggleModal();
		},
		[isZoomEnabled, toggleModal]
	);

	return (
		<div className={cn('relative', className)}>
			{children}
			{isZoomEnabled && (
				<ControlContainer onClick={handleToggleModal} className={cn('absolute bottom-4 right-4', zoomControlClassName)}>
					<ZoomInIcon className="h-3 w-3" />
				</ControlContainer>
			)}

			<Modal isOpen={isOpen} onClose={toggleModal} style={modalStyles}>
				<div className="h-full w-full" onClick={handleToggleModal}>
					{toZoomChildren}
				</div>
				<ControlContainer className="bg-foregroundPrimary absolute right-4 bottom-4" onClick={handleToggleModal}>
					<ZoomOutIcon fill={colors.backgroundTertiary} className="h-3 w-3" />
				</ControlContainer>
			</Modal>
		</div>
	);
};
