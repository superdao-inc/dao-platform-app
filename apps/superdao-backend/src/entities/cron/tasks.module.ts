import { LoggerService, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import winston from 'winston';
import { WinstonModule, WINSTON_MODULE_PROVIDER, TracerModule } from '@dev/nestjs-common';
import { TasksService } from 'src/entities/cron/tasks.service';
import { DAO_PER_DAY_CREATION } from 'src/entities/dao/constants';
import { config } from 'src/config';
import { BlockchainModule } from 'src/entities/blockchain/blockchain.module';
import { UserModule } from 'src/entities/user/user.module';
import { ContractModule } from '../contract/contract.module';
import { DaoModule } from 'src/entities/dao/dao.module';
import { CacheModule } from 'src/services/cache/cache.module';
import { DaoMembershipModule } from 'src/entities/daoMembership/dao-membership.module';
import { Treasury } from 'src/entities/treasury/treasury.model';
import { Wallet } from 'src/entities/wallet/wallet.model';
import { Whitelist } from 'src/entities/whitelist/whitelist.model';
import { Onboarding } from 'src/entities/onboarding/onboarding.model';
import { TreasuryModule } from '../treasury/treasury.module';
import { WalletModule } from '../wallet/wallet.module';
import { AlchemyModule } from 'src/services/alchemy/alchemy.module';
import { devTransports, prodTransports } from 'src/utils/logger';
import { CovalentApi } from 'src/libs/covalentApi';
import { Dao } from '../dao/dao.model';
import { CompositeBlockchainModule } from 'src/services/blockchain/blockchain.module';

const valuesToInitialize: Record<string, string | number> = {
	[DAO_PER_DAY_CREATION]: 0
};

@Module({
	providers: [
		TasksService,
		{
			provide: 'COVALENT_API',
			useFactory: async () => new CovalentApi(config.covalent.baseURL)
		}
	],
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [() => config]
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
				entities: [Treasury, Wallet, Whitelist, Onboarding, Dao],
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
		ScheduleModule.forRoot(),
		UserModule,
		DaoMembershipModule,
		BlockchainModule,
		DaoModule,
		ContractModule,
		CacheModule,
		TreasuryModule,
		WalletModule,
		AlchemyModule,
		TracerModule,
		CompositeBlockchainModule,
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
export class TasksModule {}
