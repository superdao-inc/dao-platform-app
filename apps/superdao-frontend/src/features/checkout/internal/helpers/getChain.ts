import { Chain } from '@sd/superdao-shared';

export const getChain = (chainIdStr?: string | string[]): Chain | null => {
	const chainId = typeof chainIdStr === 'string' ? +chainIdStr : 0;

	if (chainId in Chain) {
		return chainId;
	}

	return null;
};
