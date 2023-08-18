import moralis from 'moralis';
import { components } from 'moralis/types/generated/web3Api';
import { ChainId } from '@sd/superdao-shared';

import { config } from 'src/config';
import { log } from 'src/utils/logger';
import { parseNftMetadata } from './parseNftOpenseaMetadata';

const moralisApi = moralis.Web3API;

type GetNFTOwnersOptions = Parameters<typeof moralis.Web3API.token.getNFTOwners>[0];

export class MoralisService {
	static initialized = false;

	static get moralisApi() {
		if (!MoralisService.initialized) {
			moralisApi.initialize({ apiKey: config.moralis.apiKey });
			MoralisService.initialized = true;
		}
		return moralisApi;
	}

	static async getTransaction(hash: string) {
		const data = await MoralisService.moralisApi.native.getTransaction({
			chain: config.polygon.key,
			transaction_hash: hash
		});

		return data;
	}

	static async getUserNfts(colectionAddress: string, userAddress: string, limit: number = 100) {
		const data = await MoralisService.moralisApi.account.getNFTs({
			address: userAddress,
			token_addresses: [colectionAddress],
			chain: config.polygon.key,
			limit
		});

		return data.result;
	}

	static async getNfts(
		chainId: ChainId,
		address: string,
		limit: number = 100,
		cursor?: string
	): Promise<components['schemas']['nftOwnerCollection']> {
		return await MoralisService.moralisApi.account.getNFTs({
			address: address,
			chain: this.mapChainId(chainId),
			cursor: cursor,
			limit: limit
		});
	}

	private static mapChainId(chainId: ChainId) {
		switch (chainId) {
			case ChainId.BINANCE_SMART_CHAIN_MAINNET:
				return 'bsc';
			case ChainId.BINANCE_SMART_CHAIN_TESTNET:
				return 'bsc testnet';
			case ChainId.ETHEREUM_MAINNET:
				return 'eth';
			case ChainId.ETHEREUM_TESTNET_KOVAN:
				return 'kovan';
			case ChainId.ETHEREUM_TESTNET_ROPSTEN:
				return 'ropsten';
			case ChainId.POLYGON_MAINNET:
				return 'polygon';
			case ChainId.POLYGON_TESTNET_MUMBAI:
				return 'mumbai';
			default:
				throw new Error(`Unsupported chain id passed`);
		}
	}

	static async getAllNftOwners(colectionAddress: string, limit: number = 100) {
		const baseOptions: GetNFTOwnersOptions = {
			address: colectionAddress,
			chain: config.polygon.key,
			limit
		};
		let cursor = '';
		let hasNext = true;

		const owners = [];

		while (hasNext) {
			const options: GetNFTOwnersOptions = { ...baseOptions };
			if (cursor.length > 0) {
				options.cursor = cursor;
			}

			try {
				const fetchedOwners = await MoralisService.moralisApi.token.getNFTOwners(options);
				if (fetchedOwners?.result) {
					for (const owner of fetchedOwners.result) {
						let parsedMetadata;
						try {
							if (owner.metadata) {
								parsedMetadata = parseNftMetadata(owner.metadata);
							}
						} catch (e) {
							log.error('getAllNftOwners: can not parse nft metadata', { metadataStr: owner.metadata });
						}

						owners.push({
							...owner,
							metadata: parsedMetadata
						});
					}
				}

				if (fetchedOwners?.cursor) {
					cursor = fetchedOwners.cursor;
				} else {
					cursor = '';
					hasNext = false;
				}
			} catch (e) {
				log.error('getAllNftOwners: can not fetch nft owners');
				hasNext = false;
			}
		}

		return owners;
	}
}
