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
		get: operations['WalletController_getWallets'];
		post: operations['WalletController_addWallet'];
		delete: operations['WalletController_removeWallet'];
	};
	'/v3/transactions': {
		get: operations['TransactionController_getTransactions'];
	};
	'/v2/transactions': {
		get: operations['TransactionController_getTransactionsV2'];
	};
	'/v1/sync': {
		post: operations['SyncController_sync'];
	};
	'/metrics': {
		get: operations['PrometheusController_index'];
	};
}

export interface components {
	schemas: {
		AddWalletDto: {
			/** @description Blockchain ecosystem type */
			ecosystem: string;
			/** @description Wallet's address */
			address: string;
		};
		RemoveWalletDto: {
			/** @description Blockchain ecosystem type */
			ecosystem: string;
			/** @description Wallet's address */
			address: string;
		};
		TransactionEventLog: {
			blockNumber: number;
			txHash: string;
			offset: number;
			topics: string;
			address: string;
			data: string;
		};
		TransactionDto: {
			walletAddress: string;
			chainId: number;
			hash: string;
			offset: number;
			blockTimestamp: string;
			blockNumber: number;
			fromAddress: string;
			toAddress: string;
			status: number;
			value: string;
			gasUsed: number;
			gasPrice: number;
			txLogs: components['schemas']['TransactionEventLog'][];
		};
		Pagination: {
			pageNumber: number;
			pageSize: number;
			totalCount: number;
		};
		GetTransactionsResponse: {
			items: components['schemas']['TransactionDto'][];
			pagination: components['schemas']['Pagination'];
		};
		SyncWalletTransactionsDto: {
			/** @description Blockchain ecosystem type */
			ecosystem: string;
			/** @description EVM network chain ID */
			chainId: number;
			/** @description The address of the wallet that the transaction belongs to */
			address: string;
			/**
			 * @description Do it synchronously. Only in dev environment or debug purposes!
			 * @default false
			 */
			synchronously?: boolean;
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
	WalletController_getWallets: {
		parameters: {};
		responses: {
			200: unknown;
		};
	};
	WalletController_addWallet: {
		parameters: {};
		responses: {
			/** Wallet has been added */
			201: unknown;
			/** Wallet already exists */
			409: unknown;
		};
		requestBody: {
			content: {
				'application/json': components['schemas']['AddWalletDto'];
			};
		};
	};
	WalletController_removeWallet: {
		parameters: {
			query: {
				/** Blockchain ecosystem type */
				ecosystem: string;
				/** Wallet's address */
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
	TransactionController_getTransactions: {
		parameters: {
			query: {
				/** Blockchain ecosystem type */
				ecosystem: string;
				/** EVM network chain ID */
				chainIds: number[];
				/** Wallet's addresses */
				addresses: string[];
				/** Pagination: page size */
				pageSize?: number;
				/** Pagination: page number */
				pageNumber?: number;
			};
		};
		responses: {
			200: {
				content: {
					'application/json': components['schemas']['GetTransactionsResponse'];
				};
			};
		};
	};
	TransactionController_getTransactionsV2: {
		parameters: {
			query: {
				/** Blockchain ecosystem type */
				ecosystem: string;
				/** EVM network chain ID */
				chainId: number;
				/** Wallet's addresses */
				addresses: string[];
				/** Pagination: page size */
				pageSize?: number;
				/** Pagination: page number */
				pageNumber?: number;
			};
		};
		responses: {
			200: {
				content: {
					'application/json': components['schemas']['GetTransactionsResponse'];
				};
			};
		};
	};
	SyncController_sync: {
		parameters: {};
		responses: {
			201: unknown;
		};
		requestBody: {
			content: {
				'application/json': components['schemas']['SyncWalletTransactionsDto'];
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