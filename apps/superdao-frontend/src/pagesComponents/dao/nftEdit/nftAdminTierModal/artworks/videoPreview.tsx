import { useCallback, useEffect, useRef } from 'react';

export type VideoMetadata = {
	blob: string;
	id: string;
};

export type ArtworkPreviewGenerated = {
	id: string;
	image: string;
};

type Props = VideoMetadata & {
	updateArtworkPreview: (value: ArtworkPreviewGenerated) => void;
	setVideoMetadata: (val: VideoMetadata | null) => void;
};

export const VideoFirstFrame = (props: Props) => {
	const { blob, id, updateArtworkPreview, setVideoMetadata } = props;

	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const loadMetadata = useCallback(() => {
		const videoEl = videoRef.current;
		const canvasEl = canvasRef.current;

		if (!videoEl || !canvasEl) return;

		canvasEl.width = videoEl.videoWidth;
		canvasEl.height = videoEl.videoHeight;
		videoEl.currentTime = 0.1;
	}, [videoRef, canvasRef]);

	useEffect(() => {
		const videoEl = videoRef.current;

		const loadPreview = async () => {
			const videoEl = videoRef.current;
			const canvasEl = canvasRef.current;

			if (!videoEl || !canvasEl) return;

			const ctx = canvasEl.getContext('2d');
			ctx?.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
			const blob = await new Promise<Blob | null>((resolve) => canvasEl.toBlob(resolve));
			const url = blob ? URL.createObjectURL(blob) : '';

			updateArtworkPreview({
				id,
				image: url
			});

			setVideoMetadata(null);
		};

		if (videoEl) {
			videoEl.src = blob;
			videoEl.addEventListener('loadedmetadata', loadMetadata);
			videoEl.addEventListener('seeked', loadPreview);
		}
		return () => {
			videoEl?.removeEventListener('loadedmetadata', loadMetadata);
			videoEl?.removeEventListener('seeked', loadPreview);
		};
	}, [blob, id, canvasRef, videoRef, loadMetadata, updateArtworkPreview, setVideoMetadata]);

	return (
		<>
			<video className="hidden" ref={videoRef} />
			<canvas className="hidden" ref={canvasRef} />
		</>
	);
};
