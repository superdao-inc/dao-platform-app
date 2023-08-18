import { LoggerService, MiddlewareConsumer, Module } from '@nestjs/common';
import {
	makeCounterProvider,
	makeHistogramProvider,
	makeSummaryProvider,
	PrometheusModule
} from '@willsoto/nestjs-prometheus';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { exponentialBuckets } from 'prom-client';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
	ApolloServerPluginLandingPageDisabled,
	ApolloServerPluginLandingPageGraphQLPlayground
} from 'apollo-server-core';
import depthLimit from 'graphql-depth-limit';
import { createPrometheusExporterPlugin } from '@bmatei/apollo-prometheus-exporter';
import winston from 'winston';

import { WinstonModule, WINSTON_MODULE_PROVIDER, TracerModule } from '@dev/nestjs-common';

import { PromInterceptor } from 'src/prom.interceptor';

import { config } from 'src/config';
import { DAO_PER_DAY_CREATION } from 'src/entities/dao/constants';
import { graphqlHttpPlugin } from 'src/utils/graphqlConfig';
import { ApolloKeyValueCacheAdapter } from 'src/services/cache/kv.adapter';
import { CovalentApi } from 'src/libs/covalentApi';
import { EventsModule } from 'src/services/socket/events.module';
import { ConsumersModule } from 'src/services/consumers';
import { AuthModule } from 'src/entities/auth/auth.module';
import { BlockchainModule } from 'src/entities/blockchain/blockchain.module';
import { CollectionsModule } from 'src/entities/collections/collections.module';
import { DaoModule } from 'src/entities/dao/dao.module';
import { DaoMembershipModule } from 'src/entities/daoMembership/dao-membership.module';
import { DaoPassModule } from 'src/entities/daoPass/dao-pass.module';
import { ExchangeModule } from 'src/entities/exchange/exchange.module';
import { NetworkModule } from 'src/entities/network/network.module';
import { NftModule } from 'src/entities/nft/nft.module';
import { OnboardingModule } from 'src/entities/onboarding/onboarding.module';
import { PostModule } from 'src/entities/post/post.module';
import { ProposalModule } from 'src/entities/proposal/proposal.module';
import { TransactionModule } from 'src/entities/transaction/transaction.module';
import { TreasuryModule } from 'src/entities/treasury/treasury.module';
import { UserModule } from 'src/entities/user/user.module';
import { UserNotificationModule } from 'src/entities/userNotification/user-notification.module';
import { WalletModule } from 'src/entities/wallet/wallet.module';
import { WalletNftModule } from 'src/entities/walletNfts/wallet-nft.module';
import { WalletTransactionModule } from 'src/entities/walletTransaction/wallet-transaction.module';
import { WhitelistModule } from 'src/entities/whitelist/whitelist.module';
import { ContractModule } from 'src/entities/contract/contract.module';
import { CacheModule } from 'src/services/cache/cache.module';
import { PrometheusController } from 'src/prom.controller';
import { PreviewModule } from 'src/services/preview/preview.module';
import { WebhookModule } from 'src/services/webhook/webhook.module';
import { CoinMarketCapModule } from 'src/services/coinMarketCap/coinMarketCap.module';
import { DaoAnalyticsModule } from 'src/entities/daoAnalytics/daoAnalytics.module';
import { devTransports, prodTransports } from 'src/utils/logger';
import { MetaTransactionModule } from 'src/entities/metaTransaction/metaTransaction.module';
import { EthersModule } from 'src/services/ethers/ethers.module';
import { CompositeBlockchainModule } from 'src/services/blockchain/blockchain.module';
import { ReferralModule } from './entities/referral/referral.module';
import { AppController } from './app.controller';
import { RequestLoggerInterceptor } from './interceptors/requestLogger.interceptor';
import { AsyncContextMiddleware } from './middleware/asyncContext.middleware';
import { EmailVerificationModule } from './services/emailVerification/emailVerification.module';
import { NftAdminModule } from './entities/nftAdmin/nftAdmin.module';
import { EmailSettingsModule } from './entities/emailSettings/emailSettings.module';
import { AchievementsModule } from './entities/achievements/achievements.module';
import { TransactionMetricsModule } from 'src/services/transacton-metrics/transaction-metrics.module';
import { MentionsModule } from './services/mentions/mentions.module';

const labelNames = ['method', 'uri', 'code', 'class', 'handler'];

const valuesToInitialize: Record<string, string | number> = {
	[DAO_PER_DAY_CREATION]: 0
};

const DOMAIN_MODULES = [
	AchievementsModule,
	AuthModule,
	BlockchainModule,
	CacheModule,
	CoinMarketCapModule,
	CollectionsModule,
	CompositeBlockchainModule,
	ContractModule,
	DaoAnalyticsModule,
	DaoMembershipModule,
	DaoModule,
	DaoPassModule,
	EmailSettingsModule,
	EmailVerificationModule,
	ExchangeModule,
	MentionsModule,
	MetaTransactionModule,
	NetworkModule,
	NftAdminModule,
	NftModule,
	OnboardingModule,
	PostModule,
	PreviewModule,
	ProposalModule,
	ReferralModule,
	TransactionModule,
	TreasuryModule,
	UserModule,
	UserNotificationModule,
	WalletModule,
	WalletNftModule,
	WalletTransactionModule,
	WhitelistModule,
	WebhookModule
];

@Module({
	controllers: [AppController],
	providers: [
		makeCounterProvider({
			labelNames,
			name: 'http_requests_total',
			help: 'Total number of HTTP requests'
		}),
		makeHistogramProvider({
			labelNames,
			name: 'http_server_requests_seconds',
			help: 'Duration of HTTP requests in seconds',
			buckets: exponentialBuckets(0.05, 1.3, 20)
		}),
		makeSummaryProvider({
			labelNames,
			name: 'http_request_size_bytes',
			help: 'Duration of HTTP requests size in bytes'
		}),
		makeSummaryProvider({
			labelNames,
			name: 'http_response_size_bytes',
			help: 'Duration of HTTP response size in bytes'
		}),
		{
			provide: APP_INTERCEPTOR,
			useClass: RequestLoggerInterceptor
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: PromInterceptor
		}
	],
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [() => config]
		}),
		PrometheusModule.register({
			controller: PrometheusController,
			defaultMetrics: { enabled: false, config: {} }
		}),
		GraphQLModule.forRootAsync<ApolloDriverConfig>({
			driver: ApolloDriver,
			inject: [ApolloKeyValueCacheAdapter, ConfigService],
			useFactory: async (cacheAdapter: ApolloKeyValueCacheAdapter, configService: ConfigService) => ({
				// TODO: workaround: prod server env doesn't have permissions to read files from server
				autoSchemaFile: configService.get<boolean>('env.isDev') ? 'schema.gql' : true,
				// schema: await buildSchema(graphqlConfig),
				buildSchemaOptions: {
					dateScalarMode: 'isoDate'
				},
				path: '/graphql',
				playground: false,
				cors: false,
				introspection: true, // Same as previous config, but it's recommended to turn off introspection
				validationRules: [depthLimit(10)], // https://www.apollographql.com/blog/securing-your-graphql-api-from-malicious-queries-16130a324a6b/
				dataSources: () => ({ covalentAPI: new CovalentApi(config.covalent.baseURL) }),
				context: (ctx) => {
					ctx.covalentApiKey = config.covalent.apiKey;
					return ctx;
				},
				cache: cacheAdapter,
				plugins: [
					graphqlHttpPlugin,
					createPrometheusExporterPlugin({ metricsEndpoint: false }),
					process.env.APP_ENV !== 'prod'
						? ApolloServerPluginLandingPageGraphQLPlayground()
						: ApolloServerPluginLandingPageDisabled()
				]
			})
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('db.host'),
				port: configService.get('db.port'),
				username: configService.get('db.user'),
				password: configService.get('db.password'),
				database: configService.get('db.name'),
				synchronize: false,
				autoLoadEntities: true
			})
		}),
		RedisModule.forRootAsync({
			inject: [ConfigService, WINSTON_MODULE_PROVIDER],
			useFactory: async (configService: ConfigService, logger: LoggerService) => ({
				config: {
					host: configService.get('redis.host'),
					port: configService.get('redis.port'),
					username: configService.get('redis.user'),
					password: configService.get('redis.password'),
					onClientCreated: async (client) => {
						client.on('error', (err) => logger.error('Redis Client Error', err, 'RedisContext'));

						const keys = Object.keys(valuesToInitialize);
						await Promise.all(
							keys.map(async (key) => {
								const value = await client.get(key);
								if (value === null) {
									const valueToInitialize = String(valuesToInitialize[key]);
									await client.set(key, valueToInitialize);
								}
							})
						);
					}
				},
				readyLog: true
			})
		}),
		TracerModule,
		...DOMAIN_MODULES,
		EthersModule,
		EventsModule,
		ConsumersModule,
		TransactionMetricsModule,
		WinstonModule.forRootAsync({
			useFactory: (configService: ConfigService) => {
				const isProd = configService.get<boolean>('env.isProd');
				return {
					level: isProd ? 'info' : 'debug',
					format: winston.format.json(),
					transports: isProd ? prodTransports : devTransports
				};
			},
			inject: [ConfigService],
			imports: [TracerModule]
		})
	]
})
export class AppModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(AsyncContextMiddleware).forRoutes('*');
	}
}
