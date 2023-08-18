import axios, { AxiosInstance } from 'axios';
import { config } from 'src/config';
import { log } from 'src/utils/logger';

/**
 * Superdao IPFS service must be used to read data from ipfs
 * */
class SuperdaoIPFS {
	api: AxiosInstance;

	constructor() {
		this.api = axios.create({
			baseURL: `${config.urls.infuraCacheProxyServerUrl}/ipfs`
		});
	}

	async getFile<T = any>(ipfsHash: string): Promise<T> {
		try {
			const response = await this.api.get(ipfsHash);

			return response.data;
		} catch (e) {
			log.error('[getFile]', { e });
			throw e;
		}
	}
}

export const superdaoIPFS = new SuperdaoIPFS();
