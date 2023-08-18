import SafeServiceClient, { OwnerResponse } from '@gnosis.pm/safe-service-client';
import { ethers, providers } from 'ethers';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';

import flatten from 'lodash/flatten';
import { config } from 'src/config';
import { getAddress } from '@sd/superdao-shared';
import { log } from 'src/utils/logger';

const chainIds: {
	[key: number]: string;
} = {
	137: 'polygon',
	56: 'bsc'
};

const supportedNetworks = [1, 56, 137];

const DEFAULT_SAFE_SERVICE_CLIENT_URL: string = 'https://safe-transaction.gnosis.io';

const getSafeServiceClientUrl = (chain: number) => `https://safe-transaction.${chainIds[chain]}.gnosis.io`;

const getSafeService = (chainId?: number | null, address: string = '0x0000000000000000000000000000000000000000') => {
	const provider = new providers.InfuraProvider('matic', config.infura.polygonProjectId);

	const ethAdapter = new EthersAdapter({
		ethers,
		signer: new ethers.VoidSigner(address, provider)
	});

	return new SafeServiceClient({
		txServiceUrl: chainId && chainId !== 1 ? getSafeServiceClientUrl(chainId) : DEFAULT_SAFE_SERVICE_CLIENT_URL,
		ethAdapter: ethAdapter
	});
};

export const getSafeInfo = async (address: string, chainId?: number | null) =>
	await getSafeService(chainId).getSafeInfo(address);

export const getSafesAddresses = async (ownerAddress: string, chainId?: number) => {
	try {
		const parsedAddress = getAddress(ownerAddress);
		if (!parsedAddress) return null;

		const safeService = getSafeService(chainId);

		const { safes }: OwnerResponse = await safeService.getSafesByOwner(parsedAddress);

		return safes.map((safeAddress) => ({ chainId, address: safeAddress }));
	} catch (e) {
		log.error('[GnosisService]', { e });
		return null;
	}
};

export const getAllChainSafes = async (ownerAddress: string) => {
	const responses = await Promise.all(
		supportedNetworks.map(async (id) => {
			try {
				return getSafesAddresses(ownerAddress, id);
			} catch (e) {
				return [];
			}
		})
	);
	return flatten(responses);
};

export const getSafeChainId = async (safeAddress: string) => {
	for (const network of supportedNetworks) {
		try {
			const safe = await getSafeInfo(safeAddress, network);
			if (safe) return network;
		} catch (e) {}
	}
};
