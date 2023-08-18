/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
	'/': {
		get: operations['AppController_getHello'];
	};
	'/health-check': {
		get: operations['AppController_healthCheck'];
	};
	'/environment': {
		get: operations['AppController_getEnvironment'];
	};
	'/ip/info': {
		get: operations['AppController_getIpInfo'];
	};
	'/v1/wallets': {
		get: operations['WalletController_fetch'];
		post: operations['WalletController_add'];
		delete: operations['WalletController_remove'];
	};
	'/v1/sync': {
		post: operations['SyncController_update'];
	};
	'/v1/nfts': {
		get: operations['NftController_fetchAll'];
	};
	'/v1/nfts/visibility': {
		patch: operations['NftController_changeVisibility'];
	};
	'/metrics': {
		get: operations['PrometheusController_index'];
	};
}

export interface components {
	schemas: {
		AddWalletDto: {
			/** @default evm */
			ecosystem?: string;
			/** @default null */
			chainId?: number | null;
			address: string;
		};
		AddWalletDtoResponse: {
			/** @default evm */
			ecosystem?: string;
			/** @default null */
			chainId?: number | null;
			address: string;
		};
		RemoveWalletDto: {
			address: string;
		};
		RemoveWalletDtoResponse: {
			address: string;
		};
		SyncWalletNftsDto: {
			address: string;
			/** @default null */
			chainId?: number | null;
			/** @default evm */
			ecosystem?: string;
		};
		NftDto: {
			id: string;
			tokenAddress: string;
			tokenId: string;
			contractType: string;
			ownerOf: string;
			blockNumber: string;
			blockNumberMinted: string;
			tokenUri?: string;
			metadata?: string;
			syncedAt?: string;
			amount?: string;
			name: string;
			symbol: string;
			chainId: number;
			ecosystem: string;
			isPublic: boolean;
		};
		GetNftsResponse: {
			nfts: components['schemas']['NftDto'][];
			totalCount: number;
		};
		ChangeNftsVisibilityDto: {
			nftsIds: string[];
			isPublic: boolean;
		};
	};
}

export interface operations {
	AppController_getHello: {
		parameters: {};
		responses: {
			200: unknown;
		};
	};
	AppController_healthCheck: {
		parameters: {};
		responses: {
			200: unknown;
		};
	};
	AppController_getEnvironment: {
		parameters: {};
		responses: {
			200: unknown;
		};
	};
	AppController_getIpInfo: {
		parameters: {};
		responses: {
			200: unknown;
		};
	};
	WalletController_fetch: {
		parameters: {};
		responses: {
			200: unknown;
		};
	};
	WalletController_add: {
		parameters: {};
		responses: {
			201: {
				content: {
					'application/json': components['schemas']['AddWalletDtoResponse'];
				};
			};
		};
		requestBody: {
			content: {
				'application/json': components['schemas']['AddWalletDto'];
			};
		};
	};
	WalletController_remove: {
		parameters: {};
		responses: {
			200: {
				content: {
					'application/json': components['schemas']['RemoveWalletDtoResponse'];
				};
			};
		};
		requestBody: {
			content: {
				'application/json': components['schemas']['RemoveWalletDto'];
			};
		};
	};
	SyncController_update: {
		parameters: {};
		responses: {
			201: unknown;
		};
		requestBody: {
			content: {
				'application/json': components['schemas']['SyncWalletNftsDto'];
			};
		};
	};
	NftController_fetchAll: {
		parameters: {
			query: {
				addresses: string[];
				chainId?: number;
				ecosystem?: string;
				take?: number;
				skip?: number;
				isPublic?: boolean;
			};
		};
		responses: {
			200: {
				content: {
					'application/json': components['schemas']['GetNftsResponse'];
				};
			};
		};
	};
	NftController_changeVisibility: {
		parameters: {};
		responses: {
			200: unknown;
		};
		requestBody: {
			content: {
				'application/json': components['schemas']['ChangeNftsVisibilityDto'];
			};
		};
	};
	PrometheusController_index: {
		parameters: {};
		responses: {
			200: unknown;
		};
	};
}

export interface external {}