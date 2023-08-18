import { HTMLAttributes, FC } from 'react';

import Link from 'next/link';
import { CommonNavigationUserBlock } from './commonNavigationUserBlock';
import { CommonDaosSidebar } from './commonDaosSidebar';

/** Только полоска сайдбара и логотип */
export const CommonNavigationLogo: FC<HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
	return (
		<div className={`bg-backgroundTertiary z-10 flex w-[64px] flex-col`} {...props}>
			<div className="mx-auto my-6 touch-none" data-testid={'LeftMenu__logo'}>
				<Link href="/" passHref>
					<a>
						<img width="36px" height="22px" src="/logo.svg" />
					</a>
				</Link>
			</div>

			{children}
		</div>
	);
};

export const CommonNavigation = (props: HTMLAttributes<HTMLDivElement>) => {
	return (
		<CommonNavigationLogo className="bg-backgroundTertiary" {...props}>
			<CommonDaosSidebar />
			<CommonNavigationUserBlock />
		</CommonNavigationLogo>
	);
};
