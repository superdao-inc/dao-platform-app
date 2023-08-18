import { FC, HTMLAttributes } from 'react';
import classNames from 'classnames';

type InfoLabelProps = HTMLAttributes<HTMLDivElement>;

export const InfoLabel: FC<InfoLabelProps> = (props) => {
	const { children, ...divProps } = props;
	const { onClick, className } = divProps;

	return (
		<div
			{...divProps}
			className={classNames(
				'bg-backgroundTertiary inline-flex h-9 items-center gap-2 rounded-lg py-2 px-2',
				{
					'cursor-pointer': onClick
				},
				className
			)}
		>
			{children}
		</div>
	);
};
