import { FC, HTMLAttributes } from 'react';
import classNames from 'classnames';

type InfoLabelProps = HTMLAttributes<HTMLDivElement> & {
	openSea?: boolean;
};
export const InfoLabel: FC<InfoLabelProps> = (props) => {
	const { openSea, children, ...divProps } = props;
	const { onClick } = divProps;

	return (
		<div
			{...divProps}
			className={classNames('bg-backgroundTertiary h-9 items-center gap-2 rounded-lg py-2 px-3', {
				['mt-3 inline-flex']: openSea,
				['flex']: !openSea,
				'cursor-pointer': onClick
			})}
		>
			{children}
		</div>
	);
};
