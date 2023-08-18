import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { config } from 'src/config';
import { getCircularReplacer } from 'src/blockchain/utils';
import { log } from 'src/utils/logger';
import { GetDagResponse, SaveFileToIpfsResponse } from 'src/blockchain/services/types';

/**
 * Infura IPFS service provides access to ipfs http api
 * You can use it to get extra data (dag info, file info, etc...) from ipfs and save files into
 * */
class InfuraService {
	infuraApi: AxiosInstance;

	constructor() {
		const basicAuthBase64Value = Buffer.from(
			`${config.infura.ipfsProjectId}:${config.infura.ipfsProjectSecret}`
		).toString('base64');
		this.infuraApi = axios.create({
			baseURL: config.infura.ipfsEndpoint,
			headers: {
				Authorization: `Basic ${basicAuthBase64Value}`
			}
		});
	}

	async saveFileToIpfs(formData: FormData): Promise<SaveFileToIpfsResponse> {
		try {
			const response = await this.infuraApi.post('/api/v0/add', formData, {
				headers: JSON.parse(JSON.stringify(formData.getHeaders(), getCircularReplacer()))
			});

			return response.data;
		} catch (e) {
			log.error('[saveFileToIpfs]', { e });
			throw e;
		}
	}

	/**
	 * Probably you need `SuperdaoIPFS.getFile`, which is much faster
	 */
	async getIpfsFile<T = any>(ipfsHash: string): Promise<T> {
		try {
			const response = await this.infuraApi.post(`/api/v0/cat?arg=${ipfsHash}`);

			return response.data;
		} catch (e) {
			log.error('[getIpfsFile]', { e });
			throw e;
		}
	}

	async getDagInfo(ipfsHash: string): Promise<GetDagResponse> {
		try {
			const response = await this.infuraApi.post(`/api/v0/dag/get?arg=${ipfsHash}`);

			return response.data;
		} catch (e) {
			log.error('[getDag]', { e });
			throw e;
		}
	}
}

export const infuraService = new InfuraService();
