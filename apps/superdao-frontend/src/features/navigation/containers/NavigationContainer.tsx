import { MouseEventHandler } from 'react';
import { useLayoutContext } from 'src/providers/layoutProvider';

import { CommonNavigation } from '../components/commonNavigation';
import { PageNavigationProps } from '../types';

export type Props = {
	SecondaryNavigation?: React.ComponentType<PageNavigationProps>;
	useOnlyWhen?: 'authorized' | 'not_authorized';
};

export const NavigationContainer: React.FC<Props> = (props) => {
	const { SecondaryNavigation } = props;
	const [isNavigationShown, { toggle: toggleIsNavigationShown }] = useLayoutContext();

	const isPageNavigationShown = !!SecondaryNavigation;

	const appearanceStyles = isPageNavigationShown
		? 'left-[-310px] sm:left-[-352px] lg:left-0'
		: 'left-[-64px] lg:left-0';

	const handleStopPropagation: MouseEventHandler = (e) => {
		e.stopPropagation();
	};

	return (
		<>
			<div
				onClick={toggleIsNavigationShown}
				className={`fixed top-0 left-0 z-20 h-full w-full touch-none transition-all ${
					isNavigationShown
						? 'bg-overlayModal pointer-events-auto lg:pointer-events-none lg:bg-transparent'
						: 'pointer-events-none'
				}`}
			/>

			<nav
				onClick={toggleIsNavigationShown}
				className={`fixed top-0 z-20 min-w-[64px] ${
					isNavigationShown ? 'left-0' : appearanceStyles
				} bottom-0 flex transition-all ${isPageNavigationShown ? 'w-auto' : 'w-[64px]'}`}
			>
				<CommonNavigation onClick={handleStopPropagation} />

				{SecondaryNavigation && (
					<div onClick={handleStopPropagation}>
						<SecondaryNavigation toggleIsNavigationShown={toggleIsNavigationShown} />
					</div>
				)}
			</nav>
		</>
	);
};
