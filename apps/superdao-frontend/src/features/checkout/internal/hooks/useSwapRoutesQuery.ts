import { IGetRoutesResponse } from '@viaprotocol/router-sdk/dist/types';
import { useQuery, UseQueryOptions } from 'react-query';
import { viaApi } from 'src/client/via-exchange';

type Variables = {
	fromChainId: number;
	fromTokenAddress: string;
	fromAmount: number;
	toChainId: number;
	toTokenAddress: string;
};

export const useSwapRoutesQuery = (variables: Variables, options?: UseQueryOptions<IGetRoutesResponse>) =>
	useQuery<IGetRoutesResponse>(
		['SwapRoutes', variables],
		() =>
			viaApi.getRoutes({
				...variables,
				multiTx: false
			}),
		options
	);
