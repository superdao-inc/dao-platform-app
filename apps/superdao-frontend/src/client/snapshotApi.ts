import axios, { AxiosResponse } from 'axios';
import { snapshotUrl } from 'src/constants';
import { DataType, DocumentType } from 'src/client/graphql';

export const snapshotBaseApi = axios.create({
	baseURL: snapshotUrl,
	timeout: 50000,
	timeoutErrorMessage: 'Request takes more than 50 seconds'
});

export const gqlSnapshotClient = async <R = any, D = any>(
	data?: { variables?: D } & DocumentType,
	cookie?: string
): Promise<R | undefined> => {
	const headers = cookie ? { cookie } : undefined;
	const result = await snapshotBaseApi.request<DataType<R>, AxiosResponse<DataType<R>>, { variables?: D }>({
		method: 'post',
		data,
		headers
	});

	return result.data.data;
};

export const requestSnapshotWrapper =
	<T, V>(document: string, variables?: V, options?: { cookie?: string }) =>
	(): Promise<T | undefined> => {
		const cookie = options?.cookie;
		return gqlSnapshotClient({ query: document, variables }, cookie);
	};
