import { FC, ReactNode } from 'react';
import cn from 'classnames';

type Props = {
	children: ReactNode;
	onClick?: (e: React.MouseEvent) => void;
	className?: string;
};

export const ControlContainer: FC<Props> = (props) => {
	const { children, className, onClick } = props;

	return (
		<div
			onClick={onClick ? onClick : () => undefined}
			className={cn(
				`bg-overlayModal flex h-7 w-7 items-center justify-center rounded`,
				{
					'cursor-pointer': !!onClick
				},
				className
			)}
		>
			{children}
		</div>
	);
};
