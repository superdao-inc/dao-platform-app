import reduce from 'lodash/reduce';
import { POLYGON_ADDRESS_MAP } from '@sd/superdao-shared';

export const confirmDeleteModalStyle = { content: { maxWidth: 400 } };

export const selfServiceTierModalStyles = {
	overlay: {
		zIndex: 0
	}
};

export const isVideo = (filename: string) => /\.(mp4|webm|mov|mpeg|ogg|ogv|m4v)$/i.test(filename);

export const todayMidnight = new Date(new Date().setUTCHours(0, 0, 0, 0));
export const todayMidnightHtml = todayMidnight.toISOString().split('T')[0];

export const todayNoon = new Date(new Date().setUTCHours(23, 59, 59, 59));

export const nativeTokens = [
	{
		value: POLYGON_ADDRESS_MAP.MATIC.address,
		description: 'Polygon',
		label: 'MATIC'
	}
];

export const erc20Tokens = [
	{
		value: POLYGON_ADDRESS_MAP.USDT.address,
		description: 'Polygon',
		label: 'USDT'
	},
	{
		value: POLYGON_ADDRESS_MAP.USDC.address,
		description: 'Polygon',
		label: 'USDC'
	}
];

export const listVideoExt = 'video/mp4,video/webm,video/quicktime,video/mpeg,video/ogg,video/ogv,video/m4v';
export const listImageExt = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';
export const listExt = `${listImageExt},${listVideoExt}`;

const getDropzoneAccept = (ext: string): Record<string, string[]> =>
	reduce(ext.split(','), (acc, key) => ({ ...acc, [key]: [] }), {});

export const videAccept = getDropzoneAccept(listVideoExt);
export const imageAccept = getDropzoneAccept(listImageExt);
export const allAccept = { ...videAccept, ...imageAccept };

export const VIDEO_MAX_SIZE_IN_BYTE = 4194304; // 4mb
export const IMG_MAX_SIZE_IN_BYTE = 716800; // 700kb
export const MAX_ARTWORK_SIZE_TRANSLATE = { imgSize: '700KB', videoSize: '4MB' };

export const MIN_ARTWORKS_LENGTH = {
	single: 0,
	random: 2
};

export const MAX_ARTWORKS_LENGTH = {
	single: 1,
	isRandomMint: 5000,
	isRandomShuffleMint: 50000
};

export enum TIER_TYPE {
	single = 'single',
	isRandomMint = 'isRandomMint',
	isRandomShuffleMint = 'isRandomShuffleMint'
}

export const DEFAULT_TIER_ID = '0';

export const PRICE_MAX_VALIDATION = 1_000_000_000;
export const PRICE_MIN_VALIDATION = 0;
export const PRICE_STEP_VALIDATION = 0.001;

export const TIER_LIMITS_MIN_VALIDATION = 0;
export const TIER_LIMITS_STEP_VALIDATION = 1;
