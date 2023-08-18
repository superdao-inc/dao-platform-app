import { HTMLAttributes, ReactNode, useState } from 'react';
import cn from 'classnames';
import { usePopper } from 'react-popper';

import { Label1 } from 'src/components/text';
import { Avatar } from 'src/components/common/avatar';
import { useFadeTransition } from 'src/hooks/transitions/useFadeTransition';
import { Portal } from 'src/components/common/portal';

type Props = {
	daoId: string;
	name: string;
	avatar: string | null;

	isPopupMounted: boolean;
	popup: ReactNode;
	onClick: () => void;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
} & HTMLAttributes<HTMLSpanElement>;

export const DaoBioMentionComponent = (props: Props) => {
	const { daoId, name, avatar, isPopupMounted, popup, onClick, onMouseEnter, onMouseLeave, className } = props;

	const [referenceElement, setReferenceElement] = useState(null);
	const [popperElement, setPopperElement] = useState(null);
	const { styles, attributes } = usePopper(referenceElement, popperElement, {
		placement: 'bottom'
	});

	const { shouldShowEl, styles: fadeStyles } = useFadeTransition(isPopupMounted, 200);

	//TODO: check if it can be updated with new avatars
	const ImageAvatar = <Avatar seed={daoId} fileId={avatar} size="xxs" />;

	return (
		<span className="relative">
			<span
				ref={setReferenceElement as any}
				className={cn('relative inline-flex translate-y-[5px] cursor-pointer items-center gap-1', className)}
				onClick={onClick}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
			>
				{ImageAvatar}
				<Label1 className="text-accentPrimary max-w-[200px] truncate">{name}</Label1>
			</span>
			{shouldShowEl && (
				<Portal>
					<div
						ref={setPopperElement as any}
						className={cn(
							'pointer-events-none absolute top-[150%] -left-1/2 z-20 opacity-0 transition-opacity duration-200',
							fadeStyles
						)}
						style={styles.popper}
						{...attributes.popper}
					>
						{popup}
					</div>
				</Portal>
			)}
		</span>
	);
};
