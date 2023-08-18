import React, { HTMLAttributes } from 'react';
import cn from 'classnames';
import { SerializedStyles } from '@emotion/react';

type Props = HTMLAttributes<'div'> & {
	title: string;
	formCss?: SerializedStyles;
	onSubmit: () => void;
};

export const FormWrapper: React.FC<Props> = ({ title, onSubmit, formCss, children }) => {
	return (
		<form
			className={cn('flex flex-col items-start gap-[25px]')}
			onSubmit={onSubmit}
			css={formCss}
			data-testid={'Form__wrapper'}
		>
			<header className={cn('text-[36px] font-bold leading-[48px] text-white')} data-testid={'Form__title'}>
				{title}
			</header>

			{children}
		</form>
	);
};
