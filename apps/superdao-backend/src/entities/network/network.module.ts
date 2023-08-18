import { Module } from '@nestjs/common';
import { NetworkResolver } from 'src/entities/network/network.resolver';

@Module({
	providers: [NetworkResolver]
})
export class NetworkModule {}
