import { HttpModule, HttpService } from '@nestjs/axios';
import { Logger, OnModuleInit } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';

export class BlockchainHttpModule extends HttpModule implements OnModuleInit {
	private readonly logger = new Logger(BlockchainHttpModule.name);

	private responseSuccessInterceptor = (response: AxiosResponse) => {
		// Any status code that lie within the range of 2xx cause this function to trigger
		// Do something with response data
		return response;
	};

	private responseErrorInterceptor = (error: AxiosError<any>) => {
		if (error) {
			this.logger.error('Blockchain service error: ', {
				code: error.response?.data?.code,
				message: error.response?.data?.error_message
			});
		}

		return Promise.reject(error);
	};

	constructor(private readonly httpService: HttpService) {
		super();
	}

	public onModuleInit(): any {
		this.httpService.axiosRef.interceptors.response.use(this.responseSuccessInterceptor, this.responseErrorInterceptor);
	}
}
