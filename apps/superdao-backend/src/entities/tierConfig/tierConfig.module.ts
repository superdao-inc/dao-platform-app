import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TierConfig } from './tierConfig.model';
import { TierConfigService } from './tierConfig.service';

@Module({
	imports: [TypeOrmModule.forFeature([TierConfig])],
	providers: [TierConfigService],
	exports: [TierConfigService]
})
export class TierConfigModule {}
