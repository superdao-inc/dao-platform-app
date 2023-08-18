import React, { FC, useCallback, useMemo, useRef, VideoHTMLAttributes } from 'react';
import cn from 'classnames';
import { PlayIcon } from 'src/components/assets/icons';
import { useSwitch } from 'src/hooks/use-switch';
import { ValueOffIcon } from 'src/components/assets/icons/valueOff';
import { ValueOnIcon } from 'src/components/assets/icons/valueOn';
import { ControlContainer } from 'src/components/artwork/controlContainer';
import { PauseIcon } from 'src/components/assets/icons/pause';
import { ZoomInIcon } from './assets/icons/zoomIn';

export type PlayableVideoProps = {
	/**
	 * Controls whether the video play button is displayed.
	 */
	showCustomControls?: boolean;
	playOnHover?: boolean;
	imgref?: React.RefObject<HTMLImageElement>;
	isAutoPlay?: boolean;
	isZoomEnabled?: boolean;
	size?: 'sm' | 'md';
};

type Props = VideoHTMLAttributes<HTMLVideoElement> & PlayableVideoProps;

export const PlayableVideo: FC<Props> = (props: Props) => {
	const {
		poster,
		showCustomControls = true,
		playOnHover = true,
		className,
		imgref,
		isZoomEnabled,
		isAutoPlay = false,
		size = 'sm',
		...rest
	} = props;

	const videoRef = useRef<HTMLVideoElement | null>(null);

	const [isVideoPlaying, { off: stopVideo, on: startVideo }] = useSwitch(isAutoPlay);
	const [isVideoMuted, { off: unmuteVideo, on: muteVideo }] = useSwitch(true);

	const toggleVideoMuteState = useCallback(async () => {
		const video = videoRef.current;
		if (!video) return;

		if (video.muted || !video.volume) {
			video.volume = 1;
		} else {
			video.volume = 0;
		}
	}, []);

	const handleVolumeChange = useCallback(async () => {
		if (isVideoMuted) {
			unmuteVideo();
		} else {
			muteVideo();
		}
	}, [isVideoMuted, unmuteVideo, muteVideo]);

	const playVideo = useCallback(async () => {
		const video = videoRef.current;
		if (!video) return;

		if (video.paused) {
			await video.play();
			startVideo();
		}
	}, [startVideo]);

	/*
	 Don't merge these 'playVideo' and 'pauseVideo' into single function (as it was before).
	 There are cases when the cursor already hovers the video element at page startup.
	 This caused problems with video state changing logic (it became opposite - when 'hovered' video was paused,
	 when 'mouseLeave' - the video started playing).
	*/
	const pauseVideo = useCallback(async () => {
		const video = videoRef.current;
		if (!video) return;

		if (!video.paused) {
			video.currentTime = 0;
			video.pause();
			stopVideo();
		}
	}, [stopVideo]);

	const handleMouseEnter = useCallback(() => playOnHover && playVideo(), [playOnHover, playVideo]);
	const handleMouseLeave = useCallback(() => playOnHover && pauseVideo(), [playOnHover, pauseVideo]);
	const handleZoomVideo = useCallback(() => {
		const video = videoRef.current;
		if (!video) return;

		if (!isVideoPlaying) {
			playVideo();
		}

		if (video.requestFullscreen) {
			video.requestFullscreen();
		}
	}, [isVideoPlaying, playVideo]);

	const stopPropagation = useCallback(async (e: React.MouseEvent) => {
		e.stopPropagation();
	}, []);

	const toggleVideo = useCallback(async () => {
		if (isVideoPlaying) {
			pauseVideo();
		} else {
			playVideo();
		}
	}, [isVideoPlaying, pauseVideo, playVideo]);

	const onTouchEnd = useCallback(
		(e: any) => {
			if (!playOnHover) return;

			toggleVideo();
			stopPropagation(e);
		},
		[playOnHover, toggleVideo, stopPropagation]
	);

	const shouldVideoBeHidden = useMemo(() => {
		return poster !== undefined && !isVideoPlaying;
	}, [isVideoPlaying, poster]);

	return (
		<div
			className={`relative flex h-full w-full items-center justify-center`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onTouchEnd={onTouchEnd}
			onClick={stopPropagation}
		>
			<img
				className={cn('h-full max-h-full w-full rounded object-contain', className, {
					'!block': shouldVideoBeHidden,
					'!hidden': !shouldVideoBeHidden || isZoomEnabled
				})}
				ref={imgref}
				src={poster}
				alt="poster"
			/>
			<video
				className={cn('h-full w-full rounded object-contain object-center', className, {
					'!hidden': shouldVideoBeHidden && !isZoomEnabled
				})}
				poster={poster}
				onEnded={stopVideo}
				onPause={stopVideo}
				onPlay={startVideo}
				onVolumeChange={handleVolumeChange}
				ref={videoRef}
				playsInline
				autoPlay={isAutoPlay}
				muted
				{...rest}
			/>
			{showCustomControls && (
				<div
					className={cn('absolute bottom-4 flex h-auto w-full', {
						'bottom-4 pl-4 pr-4': size === 'md',
						'bottom-2 pl-2 pr-2': size === 'sm',
						'justify-end': playOnHover,
						'justify-between': !playOnHover && isZoomEnabled
					})}
				>
					{!playOnHover && (
						<ControlContainer onClick={toggleVideoMuteState}>
							{isVideoMuted ? <ValueOffIcon className="h-3 w-3" /> : <ValueOnIcon className="h-3 w-3" />}
						</ControlContainer>
					)}
					<div
						className={cn('flex', {
							'flex-1 justify-end': !isZoomEnabled && playOnHover
						})}
					>
						<ControlContainer
							onClick={!playOnHover ? toggleVideo : undefined}
							className={cn({
								hidden: isVideoPlaying && playOnHover
							})}
						>
							{isVideoPlaying ? <PauseIcon className="h-3 w-3" /> : <PlayIcon className="h-3 w-3" />}
						</ControlContainer>
						{isZoomEnabled && !playOnHover && (
							<ControlContainer className="ml-2" onClick={handleZoomVideo}>
								<ZoomInIcon className="h-3 w-3" />
							</ControlContainer>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
