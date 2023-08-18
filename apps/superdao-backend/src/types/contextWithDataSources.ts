import { Request } from 'express';
import { CovalentApi } from 'src/libs/covalentApi';

interface DataSources {
	covalentAPI: CovalentApi;
}

export interface ContextWithDataSources {
	req: Request;
	covalentApiKey: string;
	dataSources: DataSources;
}
