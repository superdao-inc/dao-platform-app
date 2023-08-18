import styled from '@emotion/styled';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import { colors } from 'src/style';
import { NftMetadata, NftOpenseaMetadata } from 'src/types/types.generated';
import 'slick-carousel/slick/slick.css';
import { Label1, Detail } from 'src/components/text';
import { useToggle } from 'src/hooks/use-toggle';
import { Loader } from 'src/components/common/loader';
import { PlayableVideo, PlayableVideoProps } from 'src/components/playableVideo';
import { Slider, SliderProps } from 'src/components/slider';
import { EmptyImgIcon } from '../assets/icons/empty-img';
import { ControlContainer } from './controlContainer';
import { ZoomContainer } from './zoomContainer';

const MAX_NUMBER_OF_ARTWORKS_TO_DISPLAY = 3;

const stopPropagation = (e: React.MouseEvent) => {
	e.stopPropagation();
};

type PlaceholderProps = { className?: string };

const DefaultMediaPlaceholder = (props: PlaceholderProps) => {
	const { className } = props;

	return (
		<ArtworkItemWrapper className={className} backgroundColor={colors.backgroundTertiary}>
			<EmptyImgIcon />
		</ArtworkItemWrapper>
	);
};

const LoadingMediaPlaceholder = (props: PlaceholderProps) => {
	const { className } = props;
	return (
		<ArtworkItemWrapper onClick={stopPropagation} className={className} backgroundColor={colors.backgroundTertiary}>
			<Loader className="!h-8" size="xl" />
		</ArtworkItemWrapper>
	);
};

type HiddenArtworksPlaceholderProps = {
	onClick?: () => void;
	className?: string;
};

const HiddenArtworksPlaceholder = (props: HiddenArtworksPlaceholderProps) => {
	const { className, onClick } = props;

	const { t } = useTranslation();

	return (
		<ArtworkItemWrapper
			className={cn(className, { 'cursor-pointer': !!onClick })}
			backgroundColor={colors.backgroundSecondary}
			onClick={onClick}
		>
			<div className="h-auto text-center">
				<Label1 color={colors.foregroundSecondary}>{t('components.artworkView.artworks')}</Label1>{' '}
			</div>
		</ArtworkItemWrapper>
	);
};

type ArtworkItemProps = {
	artwork: NftMetadata | NftOpenseaMetadata;
	/**
	 * Styles passed to artwork wrapper.
	 */
	className?: string;
	/**
	 * Styles from zoom control button
	 */
	zoomControlClassName?: string;
} & PlayableVideoProps;

const ArtworkItem = (props: ArtworkItemProps) => {
	const { artwork, showCustomControls, playOnHover, isZoomEnabled, className, isAutoPlay, size, zoomControlClassName } =
		props;
	const { animationUrl, image } = artwork;

	const [isMediaLoading, setIsMediaLoading] = useState(true);
	const [isMediaError, toggleIsMediaError] = useToggle(false);

	const setMediaIsLoaded = () => setIsMediaLoading(false);

	const imgRef = useRef<HTMLImageElement>(null);

	const loadingMediaStyle = useMemo(() => {
		if (isMediaLoading) return 'hidden';
		return '';
	}, [isMediaLoading]);

	useEffect(() => {
		const img = imgRef.current;

		/*
			If the image is cached by the browser, the 'onLoad' handler won't work.
			At the same time if the image is cached, 'img.complete' equals true.
		*/
		if (img?.complete) setMediaIsLoaded();

		let timerId: any;
		/**
		 * If the image is not empty and not loaded, try to get it by interval
		 */
		if (img && !img.complete && !isMediaLoading) {
			timerId = setInterval(() => {
				const img = imgRef.current;
				if (img?.complete) {
					setMediaIsLoaded();
					clearInterval(timerId);
				}
			}, 500);
		}

		return () => timerId && clearInterval(timerId);
	}, [imgRef, isMediaLoading]);

	if (!image && !animationUrl) {
		return <DefaultMediaPlaceholder className={className} />;
	}

	if (isMediaError) return <DefaultMediaPlaceholder className={className} />;

	// TODO: detect gif
	const isGif = false;

	let Media: ReactNode;

	const defaultClassName = 'h-full w-full object-contain object-center';

	if (animationUrl) {
		Media = (
			<PlayableVideo
				loop
				imgref={imgRef}
				src={animationUrl}
				className={cn(defaultClassName, className)}
				poster={image || undefined}
				playOnHover={playOnHover}
				showCustomControls={showCustomControls}
				isAutoPlay={isAutoPlay}
				isZoomEnabled={isZoomEnabled}
				size={size}
				onLoadedData={setMediaIsLoaded}
				onError={toggleIsMediaError}
			/>
		);
	} else if (image) {
		Media = (
			<div className={cn('relative', className)}>
				<ZoomContainer
					className={className}
					zoomControlClassName={zoomControlClassName}
					toZoomChildren={<ArtworkItem artwork={artwork} className="h-full w-full bg-transparent" />}
					isZoomEnabled={isZoomEnabled}
				>
					<img
						src={image}
						ref={imgRef}
						alt=""
						className={cn(defaultClassName, className)}
						onLoad={setMediaIsLoaded}
						onError={toggleIsMediaError}
					/>
				</ZoomContainer>
				{isGif && (
					<ControlContainer>
						<Detail className="text-foregroundPrimary h-auto">GIF</Detail>
					</ControlContainer>
				)}
			</div>
		);
	}

	return (
		<>
			{isMediaLoading && <LoadingMediaPlaceholder className={className} />}
			<ArtworkItemWrapper className={cn(loadingMediaStyle, className)}>{Media}</ArtworkItemWrapper>
		</>
	);
};

export type ArtworkViewProps = {
	artworks: Array<NftMetadata | NftOpenseaMetadata>;
	artworksTotalLength?: number;
	maxArtworksNum?: number;
	sliderProps?: SliderProps;

	/**
	 * Method in artworks placeholder
	 */
	onMore?: () => void;

	/**
	 * Styles passed to artwork wrapper.
	 */
	className?: string;
	zoomControlClassName?: string;
	wrapperClassName?: string;
	isZoomEnabled?: boolean;
} & PlayableVideoProps;

export const ArtworkView = (props: ArtworkViewProps) => {
	const {
		artworks,
		maxArtworksNum = MAX_NUMBER_OF_ARTWORKS_TO_DISPLAY,
		playOnHover,
		artworksTotalLength,
		sliderProps,
		showCustomControls,
		isAutoPlay,
		isZoomEnabled,
		className,
		zoomControlClassName,
		onMore,
		size
	} = props;

	if (artworks.length === 0) {
		return <DefaultMediaPlaceholder className={className} />;
	}

	if (artworks.length === 1 || !sliderProps?.isSlider) {
		return (
			<ArtworkItem
				artwork={artworks[0]}
				className={className}
				showCustomControls={showCustomControls}
				playOnHover={playOnHover}
				isAutoPlay={isAutoPlay}
				isZoomEnabled={isZoomEnabled}
				zoomControlClassName={zoomControlClassName}
				size={size}
			/>
		);
	}

	const shouldShowExtraSlide = artworksTotalLength && artworksTotalLength > maxArtworksNum;

	const renderArtworks = artworksTotalLength && artworksTotalLength > maxArtworksNum ? artworks.slice(0, 3) : artworks;

	return (
		<StyledSlider sliderClount={renderArtworks?.length} {...sliderProps}>
			{renderArtworks.map((artwork, i) => (
				<ArtworkItem
					artwork={artwork}
					className={className}
					zoomControlClassName={zoomControlClassName}
					showCustomControls={showCustomControls}
					playOnHover={playOnHover}
					isAutoPlay={isAutoPlay}
					isZoomEnabled={isZoomEnabled}
					size={size}
					key={i}
				/>
			))}
			{shouldShowExtraSlide && <HiddenArtworksPlaceholder className={className} onClick={onMore} />}
		</StyledSlider>
	);
};

const StyledSlider = styled(Slider)`
	height: 100%;
	* {
		height: 100%;
	}
`;

const ArtworkItemWrapper = styled.div<{ backgroundColor?: string }>`
	display: flex;
	justify-content: center;
	align-items: center;

	// Default styles. Can be overridden via 'className' prop.
	height: 208px;
	width: 208px;

	background-color: ${({ backgroundColor }) => backgroundColor};
`;
