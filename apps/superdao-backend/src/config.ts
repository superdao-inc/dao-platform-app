import 'dotenv/config'; // .env setup
import { cleanEnv, str, url, host, port } from 'envalid';
import { ethers } from 'ethers';

const enableEnvalid = !process.env.DISABLE_ENVALID;

const envalidConfig = {
	NODE_ENV: str({ choices: ['test', 'development', 'production'], default: 'development' }),
	APP_ENV: str({ choices: ['dev', 'stage', 'prod'], default: 'dev' }),
	APP_ROLE: str({ choices: ['application', 'migration'], default: 'application' }),

	RELEASE_MANAGER_PROXY: str({
		choices: ['0x22bdc4AA7204f59d78d38d82729bE76CA4e6E4Df', '0xA0768D6478977443cA62A10660a95b76b01AcA8d'],
		default: '0xA0768D6478977443cA62A10660a95b76b01AcA8d'
	}),
	POLYGON_UPDATE_MANAGER_PROXY: str({
		choices: ['0xDeB6b06E22A5BdFB2d42000074B46F9C2c3861FE', '0x39048a9a1803beF19e65B32f3f1136C370145F92'],
		default: '0x39048a9a1803beF19e65B32f3f1136C370145F92'
	}),
	POLYGON_DAO_CONSTRUCTOR_PROXY: str({
		choices: ['0xC7c3c83B9e89645A2616ea94236FD052667fa4a1', '0x61DedCcE3a184Fb6b528dbeC9026cf1fa3B14907'],
		default: '0x61DedCcE3a184Fb6b528dbeC9026cf1fa3B14907'
	}),
	POLYGON_CALL_FORWARDER_PROXY: str({
		choices: ['0x9Cb3c74545565358C223EFB941cD37dfcF854d49', '0xBEC2b80395B5831caDC78d9572712bcB1AfD6DA8'],
		default: '0xBEC2b80395B5831caDC78d9572712bcB1AfD6DA8'
	}),
	POLYGON_NFT_CLAIM_PROXY: str({
		choices: ['0x61c9CcB659628091a4cc2498c325cd46EAEa953A', '0xE8197221880281e71Ce556192cbA72baB56D0457'],
		default: '0xE8197221880281e71Ce556192cbA72baB56D0457'
	}),

	SESSION_KEY: str(),
	APP_BC_SERVICES_URL: url(),
	APP_PREVIEW_GEN_SERVICES_URL: url(),
	UPLOADCARE_PUBLIC_KEY: str(),

	MAILGUN_API_KEY: str(),
	MORALIS_API_KEY: str(),
	COVALENT_API_KEY: str(),
	COINMARKETCAP_API_KEY: str(),

	PORT: port({ default: 8000 }),
	METRICS_PORT: port({ default: 9090 }),

	DB_NAME: str(),
	DB_HOST: host(),
	DB_PORT: port(),
	DB_USER: str(),
	DB_PASSWORD: str(),

	REDIS_HOST: host(),
	REDIS_PORT: port(),
	REDIS_USER: str(),
	REDIS_PASSWORD: str(),

	RABBITMQ_HOST: host(),
	RABBITMQ_PORT: port(),
	RABBITMQ_USER: str(),
	RABBITMQ_PASSWORD: str(),

	WALLET_ASSETS_SERVICE_BASE_URL: url(),
	WALLET_NFTS_SERVICE_URL: url(),
	WALLET_TRANSACTIONS_SERVICE_URL: url(),

	KAFKA_HOST: host(),
	KAFKA_PORT: port(),
	KAFKA_USER: str(),
	KAFKA_PASSWORD: str(),

	VERIFICATION_DAO_ADDRESS: str(),
	MAGIC_PUBLISHABLE_KEY: str(),
	MAGIC_SECRET_KEY: str(),

	VERIFICATION_JWT_SECRET: str(),

	CALL_FORWARDER_ADDRESS: str(),

	THE_GRAPH_URL: url()
};

const env = enableEnvalid
	? cleanEnv(process.env, envalidConfig)
	: cleanEnv(process.env, envalidConfig, {
			reporter: () => {}
	  });

const { NODE_ENV, APP_ENV, APP_ROLE } = env;

const rabbmitMqVhost: Record<typeof APP_ENV, string> = {
	dev: '/',
	stage: 'staging',
	prod: 'production'
};

const infuraCacheProxyServerUrls: Record<typeof APP_ENV, string> = {
	dev: 'https://ipfs.k8s.superdao.co',
	stage: 'https://ipfs.k8s.superdao.co',
	prod: 'https://ipfs.k8s.superdao.co'
};

const daoMaxLimit: Record<typeof APP_ENV, number> = {
	dev: 100000,
	stage: 100000,
	prod: 300
};

export const config = {
	appEnv: APP_ENV,
	env: {
		isTest: NODE_ENV === 'test',
		isDev: NODE_ENV === 'development',
		isProd: NODE_ENV === 'production',
		isMigration: APP_ROLE === 'migration'
	},
	session: {
		maxAge: 2 * 7 * 24 * 60 * 60 * 1000 // 2 weeks
	},
	ethers: {
		privateKey: process.env.SIGNER_WALLET_PRIVATE_KEY || '',
		gaslessWalletPrivateKey: process.env.GASLESS_WALLET_PRIVATE_KEY || ''
	},
	app: {
		port: env.PORT
	},
	metrics: {
		port: env.METRICS_PORT
	},
	db: {
		name: env.DB_NAME,
		host: env.DB_HOST,
		port: env.DB_PORT,
		user: env.DB_USER,
		password: env.DB_PASSWORD
	},
	redis: {
		host: env.REDIS_HOST,
		port: env.REDIS_PORT,
		user: env.REDIS_USER,
		password: env.REDIS_PASSWORD,
		prefix: 'api-'
	},
	rabbitMq: {
		hostname: env.RABBITMQ_HOST,
		port: env.RABBITMQ_PORT,
		username: env.RABBITMQ_USER,
		password: env.RABBITMQ_PASSWORD,
		vhost: rabbmitMqVhost[APP_ENV]
	},
	kafka: {
		host: env.KAFKA_HOST,
		port: env.KAFKA_PORT,
		username: env.KAFKA_USER,
		password: env.KAFKA_PASSWORD
	},
	keys: {
		uploadcarePublicKey: env.UPLOADCARE_PUBLIC_KEY,
		session: env.SESSION_KEY
	},
	urls: {
		blockchainServicesUrl: env.APP_BC_SERVICES_URL, // Used in BlockchainModule
		previewGenServicesUrl: env.APP_PREVIEW_GEN_SERVICES_URL,
		infuraCacheProxyServerUrl: infuraCacheProxyServerUrls[APP_ENV]
	},
	polygon: {
		chainId: 137 as const,
		key: 'polygon' as const,
		gasStationUrl: 'https://gasstation-mainnet.matic.network/v2',
		releaseManagerProxy: env.RELEASE_MANAGER_PROXY,
		updateManagerProxy: env.POLYGON_UPDATE_MANAGER_PROXY,
		daoConstructorProxy: env.POLYGON_DAO_CONSTRUCTOR_PROXY,
		callForwarderProxy: env.POLYGON_CALL_FORWARDER_PROXY,
		nftClaimProxy: env.POLYGON_NFT_CLAIM_PROXY
	},
	ethereum: {
		id: 1 as const,
		key: 'ethereum' as const
		// TBD
	},
	mailgun: {
		domain: 'mg.superdao.co',
		apiKey: env.MAILGUN_API_KEY
	},
	values: {
		daoMaxLimit: daoMaxLimit[APP_ENV]
	},
	moralis: {
		apiKey: env.MORALIS_API_KEY
	},
	covalent: {
		apiKey: env.COVALENT_API_KEY,
		baseURL: 'https://api.covalenthq.com'
	},
	coinMarketCap: {
		apiKey: env.COINMARKETCAP_API_KEY,
		baseURL: 'https://pro-api.coinmarketcap.com/'
	},
	gnosis: {
		// NOTE: gnosis не поддерживает mumbai, поэтому на стейдже придется обойтись matic
		network: 'matic'
	},
	infura: {
		ipfsProjectId: process.env.IPFS_INFURA_PROJECT_ID || '',
		ipfsProjectSecret: process.env.IPFS_INFURA_PROJECT_SECRET || '',
		ipfsEndpoint: 'https://ipfs.infura.io:5001',
		ipfsGatewayUrl: 'https://ipfs.io/ipfs',

		polygonProjectId: process.env.INFURA_POLYGON_MAINNET_API_KEY || '',
		polygonUrl: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_POLYGON_MAINNET_API_KEY}`
	},
	walletAssets: {
		baseUrl: env.WALLET_ASSETS_SERVICE_BASE_URL
	},
	walletNftsService: {
		baseUrl: env.WALLET_NFTS_SERVICE_URL
	},
	walletTransactions: {
		baseUrl: env.WALLET_TRANSACTIONS_SERVICE_URL
	},
	alchemy: {
		apiKey: process.env.ALCHEMY_API_KEY
	},
	verification: {
		daoAddress: env.VERIFICATION_DAO_ADDRESS
	},
	magic: {
		apiKey: process.env.MAGIC_PUBLISHABLE_KEY,
		secretKey: process.env.MAGIC_SECRET_KEY
	},
	contracts: {
		callForwarder: env.CALL_FORWARDER_ADDRESS
	},
	gnosisWallets: {
		stage: '0x6891E61aE7CaE63263FE6Dc15Bc895f7D4B0eAd1',
		production: '0x736337020906E52ef43542e183eb6f385423d8FE'
	},
	polygonGraph: {
		url: env.THE_GRAPH_URL
	}
};

export const provider = new ethers.providers.StaticJsonRpcProvider(config.infura.polygonUrl, {
	chainId: config.polygon.chainId,
	name: config.polygon.key
});
