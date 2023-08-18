import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AlchemyService } from './alchemy.service';

@Module({
	providers: [AlchemyService],
	imports: [ConfigModule],
	exports: [AlchemyService]
})
export class AlchemyModule {}
