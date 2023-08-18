import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useLottie, LottieConfig, Lottie, Renderer } from 'react-lottie-hook';
import styled from '@emotion/styled';

interface StyledAnimationProps {
	isPaused: boolean;
}

const StyledAnimation = styled(Lottie)<StyledAnimationProps>`
	position: relative;

	opacity: ${({ isPaused }) => (isPaused ? 0 : 1)};

	transition: opacity ${({ isPaused }) => (isPaused ? 300 : 0)}ms;
`;

const defaultConfig: LottieConfig = {
	renderer: Renderer.svg,
	loop: false,
	autoplay: true
};

interface AnimationWrapperProps {
	config?: Partial<LottieConfig>;
	/** ms */
	delay?: number;
}

export const AnimationWrapper: React.FC<AnimationWrapperProps> = ({ config = {}, delay = 0, ...props }) => {
	const lottieOptions = useMemo(
		() => ({
			...defaultConfig,
			...config
		}),
		[config]
	);

	const [lottieRef, state, { pause, play }] = useLottie(lottieOptions);

	const [isDelayed, setDelayed] = useState(true);

	const start = useCallback(() => {
		setDelayed(false);
		play();
	}, [setDelayed, play]);

	useLayoutEffect(() => {
		pause();

		const timeoutId = setTimeout(start, delay);

		return () => {
			pause();
			clearTimeout(timeoutId);
		};
	}, [pause, start, delay]);

	return (
		<StyledAnimation
			lottieRef={lottieRef}
			isPaused={Boolean(isDelayed || state.isPaused || state.isStopped)}
			{...props}
		/>
	);
};
