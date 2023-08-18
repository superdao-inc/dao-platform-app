import { ReactNode } from 'react';
import cn from 'classnames';

import { Name } from 'src/pagesComponents/common/header';
import { useLayoutContext } from 'src/providers/layoutProvider';
import { ArrowLeftIcon, BurgerIcon } from './assets/icons';

type Props = {
	title?: string | ReactNode;
	className?: string;
	burgerClassName?: string;
	onBack?: () => void;
	withBurger?: boolean;
	right?: ReactNode;
};

export const MobileHeader = (props: Props) => {
	const { title = null, onBack, className, burgerClassName, withBurger, right = null } = props;
	const [_, { on: openNavigation }] = useLayoutContext();

	return (
		<div className={cn('bg-backgroundPrimary z-1 sticky top-0 flex items-center gap-4 py-3 lg:hidden', className)}>
			{withBurger && (
				<BurgerIcon className={cn('cursor-pointer', burgerClassName)} width={24} height={24} onClick={openNavigation} />
			)}

			{!withBurger && onBack && <ArrowLeftIcon className="cursor-pointer" width={24} height={24} onClick={onBack} />}

			{typeof title === 'string' ? <Name className="grow">{title}</Name> : title}

			{right}
		</div>
	);
};
