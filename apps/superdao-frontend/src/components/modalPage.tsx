import classNames from 'classnames';
import { useLayoutEffect } from 'react';
import { PageContent, PageContentProps } from './pageContent';

type ModalPageProps = PageContentProps & {
	children: any;
};

export const ModalPage = ({ children, onBack, className, columnClassName, ...rest }: ModalPageProps) => {
	useLayoutEffect(() => {
		const heightBefore = document.body.style.height;
		const overflowBefore = document.body.style.overflow;

		document.body.style.height = '100%';
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.height = heightBefore;
			document.body.style.overflow = overflowBefore;
		};
	}, []);

	return (
		<div className="bg-backgroundPrimary z-5 fixed top-0 left-0 right-0 bottom-0 overflow-auto lg:pl-[352px]">
			<PageContent
				onBack={onBack}
				className={classNames('!w-full', className)}
				columnClassName={classNames('py-5 lg:pt-0', columnClassName)}
				{...rest}
			>
				{children}
			</PageContent>
		</div>
	);
};
