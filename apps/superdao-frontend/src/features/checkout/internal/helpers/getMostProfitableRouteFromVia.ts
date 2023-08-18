import { IGetRoutesRequestParams, IGetRoutesResponse, IRoute } from '@viaprotocol/router-sdk/dist/types';
import times from 'lodash/times';
import { viaApi } from 'src/client/via-exchange';
import { VIA_NUM_ACTION } from 'src/features/checkout/internal/constants';

const fetchRoutes = async (getRoutesParams: IGetRoutesRequestParams): Promise<IRoute[]> => {
	const pagesNum = await viaApi.routesPages();

	const params = times(pagesNum, (i) => ({
		...getRoutesParams,
		offset: i + 1
	}));

	const promises = await Promise.allSettled(params.map((i) => viaApi.getRoutes(i)));
	const fulfilledPromises = promises.filter(
		(p): p is PromiseFulfilledResult<IGetRoutesResponse> => p.status === 'fulfilled'
	);
	return fulfilledPromises.flatMap((p) => p.value.routes);
};

const fetchSafeRoutes = async (getRoutesParams: IGetRoutesRequestParams) => {
	const routes = await fetchRoutes(getRoutesParams);

	return routes.filter((route) => {
		// @ts-ignore: package @viaprotocol/router-sdk is outdated and don't have 'security' field
		return route.security.score === 'SAFE_ROUTE';
	});
};

const getFilterRoutesWithEnoughMoney = (toTokenAmountWithSlippage: number) => (route: IRoute) => {
	const toTokenAmountPredict = Math.ceil(Number(route.toTokenAmount));
	return toTokenAmountPredict >= toTokenAmountWithSlippage;
};

const reduceToMinToTokenAmount = (acc: number, route: IRoute) => {
	const toTokenAmount = Math.ceil(Number(route.toTokenAmount));
	return Math.min(toTokenAmount, acc);
};

const SLIPPAGE = 1.05;

const getSafeRoutesWithEnoughMoney = async (
	_getRoutesParams: IGetRoutesRequestParams,
	requiredToTokenAmount: number
) => {
	const getRoutesParams = { ..._getRoutesParams };
	const fromAmount = getRoutesParams.fromAmount;

	// to token amount with 5% slippage
	const toTokenAmountWithSlippage = Math.ceil(requiredToTokenAmount * SLIPPAGE);
	const filterRoutesWithEnoughMoney = getFilterRoutesWithEnoughMoney(toTokenAmountWithSlippage);

	let safeRoutes = await fetchSafeRoutes(getRoutesParams);
	let safeRoutesWithEnoughMoney = safeRoutes.filter(filterRoutesWithEnoughMoney);
	let minToTokenAmount = safeRoutes.reduce(reduceToMinToTokenAmount, Number(fromAmount));

	let toTokenAmountCycleFuse = 4;

	// while and not if because of not stable provider fee
	while (!safeRoutesWithEnoughMoney.length) {
		//plus 1 percent because of getting 1.099999999999, when 1.1 is needed
		getRoutesParams.fromAmount = Math.ceil(fromAmount * (toTokenAmountWithSlippage / minToTokenAmount + 0.01));

		safeRoutes = await fetchSafeRoutes(getRoutesParams);
		safeRoutesWithEnoughMoney = safeRoutes.filter(filterRoutesWithEnoughMoney);
		minToTokenAmount = safeRoutes.reduce(reduceToMinToTokenAmount, Number(fromAmount));

		toTokenAmountCycleFuse--;
		if (!toTokenAmountCycleFuse) break;
	}

	if (!safeRoutesWithEnoughMoney.length) {
		throw new Error("safe route with enough toTokenAmount wasn't found");
	}

	return safeRoutesWithEnoughMoney;
};

type NormalizedRoute = {
	id: string;
	time: number;
	fee: number;
	actions: IRoute['actions'];
	toTokenAmount: number;
};

type NormalizedRouteWithProficiencyCoef = NormalizedRoute & {
	k: number;
};

const bigIntToNumber = (bi: BigInt): number => Math.min(Number(bi), Number.MAX_SAFE_INTEGER);

const normalizeRoutes = (routes: IRoute[]): NormalizedRoute[] =>
	routes.map((r) => {
		const { routeId, actions, toTokenAmount } = r;
		const action = actions[VIA_NUM_ACTION];

		return {
			id: routeId,
			actions,
			toTokenAmount,
			time: action.steps.map((s) => s.tool.estimatedTime).reduce((acc, s) => acc + s, 0),
			fee: bigIntToNumber(action.fee.gasActionUnits + action.fee.gasActionApproveUnits)
		};
	});

function sortRoutes(normalizedRoutes: NormalizedRoute[]): NormalizedRouteWithProficiencyCoef[] {
	const count = normalizedRoutes.length;
	const { avgFee, avgTime, minFee, minTime } = normalizedRoutes.reduce(
		(acc, e) => {
			acc.avgTime = acc.avgTime + e.time / count;
			acc.avgFee = acc.avgFee + e.fee / count;
			acc.minTime = Math.min(acc.minTime, e.time);
			acc.minFee = Math.min(acc.minFee, e.fee);

			return acc;
		},
		{
			avgTime: 0,
			avgFee: 0,
			minTime: Number.MAX_SAFE_INTEGER,
			minFee: Number.MAX_SAFE_INTEGER
		}
	);

	const result: NormalizedRouteWithProficiencyCoef[] = normalizedRoutes.map((r) => {
		const kT = (r.time - minTime) / avgTime;
		const kF = (r.fee - minFee) / avgFee;

		return {
			...r,
			k: kT + kF
		};
	});
	result.sort((a, b) => a.k - b.k);
	return result;
}

export const getMostProfitableRouteFromVia = async (
	getRoutesParams: IGetRoutesRequestParams,
	requiredToTokenAmount: number
): Promise<NormalizedRouteWithProficiencyCoef | undefined> => {
	const routes = await getSafeRoutesWithEnoughMoney(getRoutesParams, requiredToTokenAmount);

	const normalizedRoutes = normalizeRoutes(routes);
	const sortedRoutes = sortRoutes(normalizedRoutes);

	return sortedRoutes[0];
};
