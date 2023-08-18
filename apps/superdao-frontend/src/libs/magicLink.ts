import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth';

import { Chain } from '@sd/superdao-shared';
import { config } from 'src/constants';

const {
	infura: { polygonUrl },
	magic: { magicPublishableKey }
} = config;

const customNodeOptions = {
	rpcUrl: polygonUrl, // Polygon RPC URL
	chainId: Chain.Polygon // Polygon chain id
};

// Create client-side Magic instance
const createMagic = (key: string | undefined) => {
	if (typeof window === 'undefined' || !key) {
		return;
	}

	return new Magic(key, {
		network: customNodeOptions,
		extensions: [new OAuthExtension()]
	});
};

export type MagicLinkType = ReturnType<typeof createMagic>;
export const magicLink = createMagic(magicPublishableKey);
