const sortByAscending = (prev: number, next: number) => prev - next;

export const getRedisExchangeCurrenciesPairsLastUpdatedKey = (
	quoteCurrenciesIds: number[],
	baseCurrenciesIds: number[]
) => {
	const sortedQuotes = quoteCurrenciesIds.sort(sortByAscending).join('-');
	const sortedBases = baseCurrenciesIds.sort(sortByAscending).join('-');

	return `coinMarketCap:currencies:lastUpdated:${sortedQuotes}:${sortedBases}`;
};

export const getRedisExchangeCurrenciesPairsKey = (quoteCurrenciesIds: number[], baseCurrenciesIds: number[]) => {
	const sortedQuotes = quoteCurrenciesIds.sort(sortByAscending).join('-');
	const sortedBases = baseCurrenciesIds.sort(sortByAscending).join('-');

	return `coinMarketCap:currencies:pairs:${sortedQuotes}:${sortedBases}`;
};

export const getRedisExchangePairsLastUpdatedKey = (quoteCurrenciesIds: number[]) => {
	const sortedQuotes = quoteCurrenciesIds.sort(sortByAscending).join('-');

	return `coinMarketCap:lastUpdated:${sortedQuotes}`;
};

export const getRedisExchangePairsKey = (quoteCurrenciesIds: number[]) => {
	const sortedQuotes = quoteCurrenciesIds.sort(sortByAscending).join('-');

	return `coinMarketCap:pairs:${sortedQuotes}`;
};
