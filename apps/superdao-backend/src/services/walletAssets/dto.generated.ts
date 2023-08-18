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
	'/v1/tokens': {
		get: operations['TokenController_fetch'];
		post: operations['TokenController_add'];
		delete: operations['TokenController_remove'];
	};
	'/v1/prices/update': {
		post: operations['PriceController_update'];
	};
	'/v1/sync': {
		post: operations['SyncController_update'];
	};
	'/v1/sync/schedule': {
		post: operations['SyncController_schedule'];
	};
	'/v1/assets': {
		get: operations['AssetController_fetch'];
	};
	'/v1/assets/summary': {
		get: operations['AssetController_assetsSummary'];
	};
	'/v1/cmc-tokens': {
		get: operations['CmcTokenController_fetch'];
		post: operations['CmcTokenController_add'];
		delete: operations['CmcTokenController_remove'];
	};
	'/metrics': {
		get: operations['PrometheusController_index'];
	};
	'/v1/cmc-assets': {
		get: operations['CmcAssetController_fetch'];
	};
	'/v1/cmc-assets/summary': {
		get: operations['CmcAssetController_summary'];
	};
}

export interface components {
	schemas: {
		AddWalletDto: {
			/** @description Blockchain ecosystem type: evm, solana, ton etc. */
			ecosystem: string;
			/** @description Address identifier */
			address: string;
		};
		RemoveWalletDto: {
			/** @description Blockchain ecosystem type: evm, solana, ton etc. */
			ecosystem: string;
			/** @description Address identifier */
			address: string;
		};
		WalletEntity: {
			ecosystem: string;
			address: string;
			/** Array of ERC-20 tokens */
			assets: components['schemas']['AssetEntity'][];
			/** Format: date-time */
			created: string;
			/** Format: date-time */
			updated: string;
		};
		PriceEntity: {
			ecosystem: string;
			chainId: number;
			/** @description Token price in USD */
			value: number;
			token: components['schemas']['TokenEntity'];
			/** Format: date-time */
			updated: string;
		};
		TokenEntity: {
			address: string | null;
			ecosystem: string;
			chainId: number;
			name: string;
			type: string;
			decimals: number;
			symbol: string;
			/** @description URL */
			logo: string;
			/** @description Price of token */
			price: components['schemas']['PriceEntity'];
			/** Format: date-time */
			created: string;
			/** Format: date-time */
			updated: string;
		};
		CostViewEntity: {
			/** @description Price in USD */
			value: number;
			/** @description Valuable asset in wallet which current price object is for */
			asset: components['schemas']['AssetEntity'];
		};
		AssetEntity: {
			address: string;
			ecosystem: string;
			chainId: number;
			/** @description Owning wallet */
			wallet: components['schemas']['WalletEntity'];
			/** @description ERC-20 Token description */
			token: components['schemas']['TokenEntity'];
			/** @description Balance in wei dimension */
			balance: string;
			/** @description Extension value in USD (calculates separately) */
			cost: components['schemas']['CostViewEntity'];
			/** Format: date-time */
			updated: string;
		};
		AddTokenDto: {
			/** @description Id can be set manually if needs */
			id: string;
			/** @description Network type: evm, solana, ton, etc. */
			ecosystem?: string;
			/** @description Can be native or erc-20 value */
			type: string;
			/**
			 * @description EVM chain specific
			 * @default null
			 */
			chainId?: number;
			/** @description ERC-20 contract address */
			address: string;
			/** @description Token name: Doge coin, Ether, etc. */
			name: string;
			/** @description ETH, MATIC or DOGE etc. */
			symbol: string;
			/** @description ERC-20 Token logo URL */
			logo: string;
			/** @description ERC-20 Token price */
			price: number;
			/** @description Decimals in token balance */
			decimals: number;
			/** @description ERC-20 Token CMC ID */
			cmcId: number;
		};
		RemoveTokenDto: {
			/** @description Network type: evm, solana, ton, etc. */
			ecosystem: string;
			/** @description EVM chain specific */
			chainId: number;
			/** @description ERC-20 contract address */
			address: string;
		};
		SyncWalletAssets: {
			ecosystem: string;
			chainId: number;
			address: string;
		};
		CostModel: {
			ecosystem: string;
			chainId: string;
			name: string;
			symbol: string;
			type: string;
			contract: string;
			logo: string;
			decimals: number;
			price: string;
			balance: string;
			cost: number;
		};
		CmcTokenEntity: {
			name: string;
			type: string;
			/** @description URL */
			logo: string;
			/** @description Price of token */
			price: components['schemas']['PriceEntity'];
			symbol: string;
			/** @description Decimals in token balance */
			decimals: number;
			address: string | null;
			ecosystem: string;
			chainId: number;
			/** Format: date-time */
			created: string;
			/** Format: date-time */
			updated: string;
		};
		CmcAssetEntity: {
			address: string;
			ecosystem: string;
			chainId: number;
			/** @description Owning wallet */
			wallet: components['schemas']['WalletEntity'];
			/** @description ERC-20 Token description */
			token: components['schemas']['CmcTokenEntity'];
			/** @description Balance */
			balance: string;
			/** @description Extension value in USD (calculates separately) */
			cost: components['schemas']['CmcCostViewEntity'];
			/** Format: date-time */
			updated: string;
		};
		CmcCostViewEntity: {
			/** @description Price in USD */
			value: number;
			/** @description Valuable asset in wallet which current price object is for */
			asset: components['schemas']['CmcAssetEntity'];
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
		parameters: {
			query: {
				/** Blockchain ecosystem type: evm, solana, ton etc. */
				ecosystem: string;
				/** Address identifier */
				address: string;
				/** EVM chains option only */
				chainId: number;
			};
		};
		responses: {
			/** Wallet fetched */
			200: {
				content: {
					'application/json': components['schemas']['WalletEntity'];
				};
			};
			/** Wallet not found */
			404: unknown;
		};
	};
	WalletController_add: {
		parameters: {};
		responses: {
			/** Wallet added */
			201: {
				content: {
					'application/json': components['schemas']['AddWalletDto'];
				};
			};
			/** Wallet already exists */
			409: unknown;
		};
		requestBody: {
			content: {
				'application/json': components['schemas']['AddWalletDto'];
			};
		};
	};
	WalletController_remove: {
		parameters: {
			query: {
				/** Blockchain ecosystem type: evm, solana, ton etc. */
				ecosystem: string;
				/** Address identifier */
				address: string;
			};
		};
		responses: {
			/** Wallet removed */
			200: {
				content: {
					'application/json': components['schemas']['RemoveWalletDto'];
				};
			};
			/** Wallet does not exist */
			410: unknown;
		};
	};
	TokenController_fetch: {
		parameters: {
			query: {
				/** Network type: evm, solana, ton, etc. */
				ecosystem: string;
				/** EVM chain specific */
				chainId: number;
				/** ERC-20 contract address */
				address: string;
				/** The response page contains elements */
				take: number;
				/** How many elements to skip */
				skip: number;
			};
		};
		responses: {
			/** Token fetched */
			200: {
				content: {
					'application/json': components['schemas']['TokenEntity'][];
				};
			};
			/** Token not found */
			404: unknown;
		};
	};
	TokenController_add: {
		parameters: {};
		responses: {
			/** Token created */
			201: {
				content: {
					'application/json': components['schemas']['AddTokenDto'];
				};
			};
			/** Token already exists */
			409: unknown;
		};
		requestBody: {
			content: {
				'application/json': components['schemas']['AddTokenDto'];
			};
		};
	};
	TokenController_remove: {
		parameters: {
			query: {
				/** Network type: evm, solana, ton, etc. */
				ecosystem: string;
				/** EVM chain specific */
				chainId: number;
				/** ERC-20 contract address */
				address: string;
			};
		};
		responses: {
			/** Token removed */
			200: {
				content: {
					'application/json': components['schemas']['RemoveTokenDto'];
				};
			};
			/** Token does not exist */
			410: unknown;
		};
	};
	PriceController_update: {
		parameters: {};
		responses: {
			/** Update prices in storage */
			200: unknown;
		};
	};
	SyncController_update: {
		parameters: {};
		responses: {
			/** Run ERC-20 update for specific wallet */
			200: unknown;
		};
		requestBody: {
			content: {
				'application/json': components['schemas']['SyncWalletAssets'];
			};
		};
	};
	SyncController_schedule: {
		parameters: {};
		responses: {
			/** Wallet sync scheduled */
			200: unknown;
		};
		requestBody: {
			content: {
				'application/json': components['schemas']['SyncWalletAssets'];
			};
		};
	};
	AssetController_fetch: {
		parameters: {
			query: {
				/** Blockchain ecosystem type: evm, solana, ton etc. */
				ecosystem: string;
				/** EVM chains option only. */
				chainId?: number;
				/** Address identifiers with ',' separator */
				addresses: string[];
				/** How many elements the response page contains. */
				take: number;
				/** Skip elements. */
				skip: number;
			};
		};
		responses: {
			/** Fetch ERC-20 assets with prices for specific addresses */
			200: {
				content: {
					'application/json': components['schemas']['AssetEntity'][];
				};
			};
		};
	};
	AssetController_assetsSummary: {
		parameters: {
			query: {
				/** Blockchain ecosystem type: evm, solana, ton etc. */
				ecosystem: string;
				/** EVM chains option only. */
				chainId?: number;
				/** Address identifiers with ',' separator */
				addresses: string[];
				/** How many elements the response page contains. */
				take: number;
				/** Skip elements. */
				skip: number;
			};
		};
		responses: {
			/** Fetch ERC-20 assets with prices for specific addresses grouped by token */
			200: {
				content: {
					'application/json': components['schemas']['CostModel'][];
				};
			};
		};
	};
	CmcTokenController_fetch: {
		parameters: {
			query: {
				/** Network type: evm, solana, ton, etc. */
				ecosystem: string;
				/** EVM chain specific */
				chainId: number;
				/** ERC-20 contract address */
				address: string;
				/** The response page contains elements */
				take: number;
				/** How many elements to skip */
				skip: number;
			};
		};
		responses: {
			/** Token fetched */
			200: {
				content: {
					'application/json': components['schemas']['CmcTokenEntity'][];
				};
			};
			/** Token not found */
			404: unknown;
		};
	};
	CmcTokenController_add: {
		parameters: {};
		responses: {
			/** Token created */
			201: {
				content: {
					'application/json': components['schemas']['AddTokenDto'];
				};
			};
			/** Token already exists */
			409: unknown;
		};
		requestBody: {
			content: {
				'application/json': components['schemas']['AddTokenDto'];
			};
		};
	};
	CmcTokenController_remove: {
		parameters: {
			query: {
				/** Network type: evm, solana, ton, etc. */
				ecosystem: string;
				/** EVM chain specific */
				chainId: number;
				/** ERC-20 contract address */
				address: string;
			};
		};
		responses: {
			/** Token removed */
			200: {
				content: {
					'application/json': components['schemas']['RemoveTokenDto'];
				};
			};
			/** Token does not exist */
			410: unknown;
		};
	};
	PrometheusController_index: {
		parameters: {};
		responses: {
			200: unknown;
		};
	};
	CmcAssetController_fetch: {
		parameters: {
			query: {
				/** Blockchain ecosystem type: evm, solana, ton etc. */
				ecosystem: string;
				/** EVM chains option only. */
				chainId?: number;
				/** Address identifiers with ',' separator */
				addresses: string[];
				/** How many elements the response page contains. */
				take: number;
				/** Skip elements. */
				skip: number;
			};
		};
		responses: {
			/** Fetch ERC-20 assets with prices for specific addresses */
			200: {
				content: {
					'application/json': components['schemas']['CmcAssetEntity'][];
				};
			};
		};
	};
	CmcAssetController_summary: {
		parameters: {
			query: {
				/** Blockchain ecosystem type: evm, solana, ton etc. */
				ecosystem: string;
				/** EVM chains option only. */
				chainId?: number;
				/** Address identifiers with ',' separator */
				addresses: string[];
				/** How many elements the response page contains. */
				take: number;
				/** Skip elements. */
				skip: number;
			};
		};
		responses: {
			/** Fetch ERC-20 assets with prices for specific addresses grouped by token */
			200: {
				content: {
					'application/json': components['schemas']['CostModel'][];
				};
			};
		};
	};
}

export interface external {}