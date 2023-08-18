import cn from 'classnames';
import React from 'react';

type Props = {
	children?: React.ReactNode;
};

export const PageNavigationWrapper: React.FC<Props> = ({ children }) => {
	return (
		<div
			className={cn('bg-backgroundSecondary h-full min-h-full', {
				'w-[246px] sm:w-[288px]': Boolean(children)
			})}
		>
			{children}
		</div>
	);
};
