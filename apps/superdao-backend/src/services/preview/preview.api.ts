import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ConstantBackoff, handleWhen, retry } from 'cockatiel';

import { config } from 'src/config';

import { ExternalApiConnector } from '../externalConnector/externalApiConnector.helper';

import { IBullQueueResponse, IDaoProfilePreviewParams, ImageError } from './types';

const RETRY_GET_IMAGE_COUNT = 5;
const RETRY_GET_IMAGE_TIMEOUT = 5000;

@Injectable()
export class PreviewApi {
	private readonly client: AxiosInstance;
	private readonly logger = new Logger(PreviewApi.name);

	constructor(@Inject('PreviewConnector') public externalConnector: ExternalApiConnector) {
		this.client = axios.create({
			baseURL: config.urls.previewGenServicesUrl
		});
	}

	/**
	 * need to be removed after bullMq in production
	 * @deprecated
	 */
	async generateDaoProfilePreview(params: IDaoProfilePreviewParams) {
		return this.externalConnector.execute(() =>
			this.client({
				url: '/generate-dao-profile-preview',
				method: 'get',
				responseType: 'arraybuffer',
				params
			})
		);
	}

	async registerDaoProfilePreview(params: IDaoProfilePreviewParams): Promise<AxiosResponse<IBullQueueResponse>> {
		return this.externalConnector.execute(() =>
			this.client({
				url: '/register/generate-dao-profile-preview',
				method: 'get',
				params
			})
		);
	}

	// used to try getting image for 30 seconds without braking the circuit
	async getImage(imageHashSum: string) {
		const retryPolicy = retry(
			handleWhen((err) => err instanceof ImageError),
			{ maxAttempts: RETRY_GET_IMAGE_COUNT, backoff: new ConstantBackoff(RETRY_GET_IMAGE_TIMEOUT) }
		);

		retryPolicy.onSuccess(({ duration }) =>
			this.logger.log(`[Preview API getImage onSuccess] Got preview with hashSum`, {
				imageHashSum,
				duration
			})
		);

		retryPolicy.onFailure((reason) =>
			this.logger.error(`[Preview API getImage onFailure] Cannot get image buffer response`, {
				reason,
				imageHashSum
			})
		);

		retryPolicy.onRetry((reason) =>
			this.logger.error(`[Preview API getImage onRetry] Retry gettting image buffer response`, {
				reason,
				imageHashSum
			})
		);

		retryPolicy.onGiveUp((reason) =>
			this.logger.error(
				`[Preview API getImage onGiveUp] Error while getting image buffer response after several attempts`,
				{
					reason,
					imageHashSum,
					count: RETRY_GET_IMAGE_COUNT,
					backoff: RETRY_GET_IMAGE_TIMEOUT
				}
			)
		);

		//should be retried without breaking service health status (cycled image requesting)
		return retryPolicy.execute(async () => {
			const imageResponse = await this.client({
				url: `/image/${imageHashSum}`,
				method: 'get',
				responseType: 'arraybuffer'
			});

			if (imageResponse.status === HttpStatus.NO_CONTENT) throw new ImageError('No image found');

			return imageResponse;
		});
	}
}
