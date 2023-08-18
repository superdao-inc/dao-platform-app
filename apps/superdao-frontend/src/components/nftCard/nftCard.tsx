import React, { FC, memo, ReactNode } from 'react';
import cn from 'classnames';

import { ArtworkView, ArtworkViewProps } from 'src/components/artwork';

export type NftCardProps = {
	badge?: ReactNode;
	artworkProps: ArtworkViewProps;
	onClick?: (e: React.MouseEvent) => void;
	className?: string;
	children?: ReactNode;
};

const NftCard: FC<NftCardProps> = (props) => {
	const { onClick, badge, children, artworkProps, className = '' } = props;
	const { className: artworkClassName, wrapperClassName } = artworkProps;

	return (
		<div
			onClick={onClick}
			className={cn(
				'bg-backgroundSecondary group relative flex cursor-pointer flex-col overflow-hidden rounded-md lg:p-4',
				className,
				{
					pointer: onClick
				}
			)}
		>
			{badge}

			<div
				className={cn(
					'min-h-[156px] flex-grow transition-opacity group-hover:opacity-75',
					'md:min-h-[376px]',
					'lg:h-[208px] lg:max-h-[208px] lg:min-h-[208px] lg:items-center lg:justify-center lg:rounded',
					wrapperClassName
				)}
			>
				<ArtworkView
					{...artworkProps}
					className={cn(artworkClassName, 'h-full w-full object-cover object-center sm:h-full sm:w-full lg:rounded')}
				/>
			</div>

			{children && <div className="mx-3 mt-3 mb-3 lg:mx-0 lg:mb-0">{children}</div>}
		</div>
	);
};

export default memo(NftCard);
