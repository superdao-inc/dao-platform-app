import axios, { AxiosInstance } from 'axios';
import { GetQuotesRequest, GetQuotesResponse } from 'src/services/coinMarketCap/dto/quotes.dto';
import { config } from 'src/config';

const { apiKey, baseURL } = config.coinMarketCap;

class CoinMarketCap {
	private readonly client: AxiosInstance;

	constructor() {
		this.client = axios.create({
			baseURL,
			headers: {
				'X-CMC_PRO_API_KEY': apiKey
			}
		});
	}

	/**
	 * If you have many tokens to convert, pass them in the "baseCurrenciesIds" parameter to spend fewer CoinMarketCap API credits for request.
	 * Every tokenId passed in quoteCurrenciesIds guaranteed will use 1 credit, however many tokenIds passed in "baseCurrenciesIds" will use only one API credit for 100 items.
	 * @see https://coinmarketcap.com/api/documentation/v1/#operation/getV2CryptocurrencyQuotesLatest
	 */
	public async getQuotes(request: GetQuotesRequest): Promise<GetQuotesResponse> {
		const { baseCurrenciesIds, quoteCurrenciesIds } = request;

		const params: any = {
			id: arrayToQuery(baseCurrenciesIds),
			aux: 'platform'
		};

		if (quoteCurrenciesIds) {
			params.convert_id = arrayToQuery(quoteCurrenciesIds);
		}

		const response = await this.client.get<GetQuotesResponse>('/v2/cryptocurrency/quotes/latest', {
			params
		});

		return response.data;
	}
}

export const arrayToQuery = (array: any[]) => array.join(',');

export const coinMarketCapClient = new CoinMarketCap();
