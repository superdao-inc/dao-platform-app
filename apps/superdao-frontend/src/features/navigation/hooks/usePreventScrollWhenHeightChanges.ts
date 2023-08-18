import { RefObject, useCallback, useEffect, useState } from 'react';
import { useLayoutContext } from 'src/providers/layoutProvider';
import { usePreventScroll } from 'src/hooks/usePreventScroll';

/** Prevent scroll on touchmove, when an element isn't scrollable.
 *  This fixes the behaviour when touchmove on a non-scrollable element scrolls <body>.
 */
export const usePreventScrollWhenHeightChanges = <T extends HTMLElement>(el: RefObject<T>) => {
	const [hasScroll, setHasScroll] = useState(false);
	const [isNavigationShown] = useLayoutContext();

	const onResize = useCallback(() => {
		if (!isNavigationShown) {
			setHasScroll(true);
		} else if (el?.current) {
			const { scrollHeight = 0, clientHeight = 0 } = el.current;
			const _hasScroll = scrollHeight > clientHeight;

			setHasScroll(_hasScroll);
		}
	}, [el, isNavigationShown]);

	useEffect(() => {
		window.addEventListener('resize', onResize);
		onResize();

		return () => {
			window.removeEventListener('resize', onResize);
		};
	}, [onResize]);

	usePreventScroll(!hasScroll, el);
};
