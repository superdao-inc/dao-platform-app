import 'reflect-metadata'; // required by typegraphql
import { ConfigService } from '@nestjs/config';
import session from 'cookie-session';
import { NestFactory } from '@nestjs/core';
import http from 'http';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from '@dev/nestjs-common';
import { config } from 'src/config';
import { RedisIoAdapter } from 'src/services/socket/redis-io.adapter';
import { AppModule } from 'src/app.module';
import { AllExceptionFilter } from 'src/all-exception.filter';
import { getKafkaOptions } from 'src/services/kafka/getKafkaOptions';
import { rabbitMqService } from './services';

async function bootstrap() {
	// Checking rabbit...
	await rabbitMqService.init();

	const server = express();
	const adapter = new ExpressAdapter(server);

	const app = await NestFactory.create(AppModule, adapter, { bufferLogs: true });

	const logger = await app.resolve<LoggerService>(WINSTON_MODULE_PROVIDER);
	app.useLogger(logger);

	app.use(
		session({
			keys: [config.keys.session],
			maxAge: config.session.maxAge
		})
	);
	app.enableCors({
		credentials: true,
		origin: ['http://localhost:8000', 'http://localhost:3000']
	});
	app.enableShutdownHooks(['SIGINT', 'SIGTERM']);
	app.useGlobalFilters(new AllExceptionFilter(adapter));

	const redisIoAdapter = new RedisIoAdapter(app);
	await redisIoAdapter.connectToRedis();
	app.useWebSocketAdapter(redisIoAdapter);

	const configService = app.get(ConfigService);

	const kafkaOptions = getKafkaOptions(configService);
	app.connectMicroservice(kafkaOptions);

	await app.startAllMicroservices();

	await app.listen(configService.get<number>('app.port')!);

	logger.log(`Server on http://localhost:${configService.get<number>('app.port')}`);

	if (config.env.isProd) {
		http.createServer(server).listen(configService.get<number>('metrics.port')!);
		logger.log(`Metrics on http://localhost:${configService.get<number>('metrics.port')}`);
	}
}

bootstrap();
