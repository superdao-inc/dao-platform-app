import getConfig from 'next/config';
import { Chain, networkMap } from '@sd/superdao-shared';

const { publicRuntimeConfig } = getConfig();

export const environment = publicRuntimeConfig.APP_ENV;
export const isProduction = environment === 'prod';
export const isStage = environment === 'stage';
export const isDev = environment === 'dev';

export const vercelAnalyticsID = publicRuntimeConfig.VERCEL_ANALYTICS_ID;

export const snapshotUrl = 'https://hub.snapshot.org/graphql';
export const winterUrl = 'https://checkout.usewinter.com';

export const viaApiKey = publicRuntimeConfig.VIA_API_KEY;

export const DESKTOP_BREAKPOINT = 1200;

export const infuraProjectId = publicRuntimeConfig.INFURA_POLYGON_MAINNET_API_KEY;

const magicPublishableKey = publicRuntimeConfig.MAGIC_PUBLISHABLE_KEY;

export const config = {
	polygon: networkMap[Chain.Polygon],
	ethereum: networkMap[Chain.Ethereum],
	infura: {
		polygonUrl: `https://polygon-mainnet.infura.io/v3/${infuraProjectId}`,
		infuraProjectId
	},
	magic: {
		magicPublishableKey
	},
	backend: publicRuntimeConfig.BACKEND_SERVICE_URL
};
