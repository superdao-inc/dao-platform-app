import { useCallback } from 'react';
import { MediaCompression } from './mediaCompression';

interface Compressor {
	(file: File): Promise<{ resultData: Uint8Array | File | ArrayBuffer; resultSize: number }>;
}

export const useMediaCompression = () => {
	const getCompressorByType = useCallback((type: string): Compressor => {
		const h: Record<string, Compressor> = {
			'image/jpeg': MediaCompression.compressJPEG,
			'image/png': MediaCompression.convertPNG,
			'image/gif': MediaCompression.compressGIF
		};

		if (!h[type]) throw Error(`Type ${type} is not supported`);

		return h[type];
	}, []);

	const compress = useCallback(
		async (file: File) => {
			const type = file.type;
			const initialSize = file.size;
			const compressor = getCompressorByType(type);

			const { resultData, resultSize } = await compressor(file);

			const blob = resultData instanceof Blob ? resultData : new Blob([resultData], { type });

			return {
				initialSize,
				compressedSize: resultSize,
				blob
			};
		},
		[getCompressorByType]
	);

	return { compress };
};
