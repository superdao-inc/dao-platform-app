import { Module } from '@nestjs/common';
import { AudienceService } from './audience.service';
import { AudienceResolver } from './audience.resolver';

@Module({
	providers: [AudienceService, AudienceResolver]
})
export class AudienceModule {}
