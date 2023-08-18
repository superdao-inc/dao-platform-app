import { useMountTransition } from './useMountTransition';

export const useFadeTransition = (isMounted: boolean, unmountDelay: number, mountDelay: number = 0) => {
	const hasTransitionedIn = useMountTransition(isMounted, unmountDelay, mountDelay);

	return {
		styles: {
			'!opacity-100': hasTransitionedIn,
			'!opacity-0': !isMounted
		},
		shouldShowEl: isMounted || hasTransitionedIn
	};
};
