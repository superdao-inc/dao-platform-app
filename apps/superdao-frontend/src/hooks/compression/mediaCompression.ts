import { detectJpegOrientation, readFileAsync } from './utils';

export class MediaCompression {
	static async compressJPEG(file: File, quality = 75) {
		const jpegWorker = await import('./workers/mozjpeg.worker');
		const converter = new jpegWorker.JpegConverter();
		await converter.init();

		const contentBuffer = await readFileAsync(file);
		const orientation = detectJpegOrientation(contentBuffer);

		return converter.convert(contentBuffer, orientation, quality);
	}

	static async convertPNG(file: File) {
		const contentBuffer = await readFileAsync(file);
		const pngWorker = (await import('./workers/oxipng')).default;

		const optimisedPngBuffer = await pngWorker(contentBuffer, { level: 2 });

		return {
			resultData: optimisedPngBuffer,
			resultSize: optimisedPngBuffer.byteLength
		};
	}

	static async compressGIF(file: File) {
		// @ts-ignore
		const gifsicle = await import('gifsicle-wasm-browser');
		const [outFile]: File[] = await gifsicle.run({
			input: [
				{
					file,
					name: '1.gif'
				}
			],
			command: [`-O2 --lossy=70 1.gif  -o /out/out.gif`]
		});

		if (!(outFile instanceof Blob)) throw Error(`compressGIF resulted not a blob`);

		return { resultData: outFile, resultSize: outFile.size };
	}
}
