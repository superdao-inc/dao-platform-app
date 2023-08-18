import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';
import { KAFKA_CLIENT_SERVICE } from './constants';

import { getKafkaOptions } from './getKafkaOptions';
import { ProducerService } from './producer.service';

@Module({
	providers: [
		{
			provide: KAFKA_CLIENT_SERVICE,
			useFactory: (configService: ConfigService) => {
				const options = getKafkaOptions(configService);
				return ClientProxyFactory.create(options);
			},
			inject: [ConfigService]
		},
		ProducerService
	],
	exports: [ProducerService]
})
export class KafkaModule {}
