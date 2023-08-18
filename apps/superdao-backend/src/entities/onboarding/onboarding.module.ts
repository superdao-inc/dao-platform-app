import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientFeatureResolver } from './clientFeature.resolver';
import { ClientFeature } from 'src/entities/onboarding/clientFeature.model';
import { Onboarding } from 'src/entities/onboarding/onboarding.model';

@Module({
	imports: [TypeOrmModule.forFeature([ClientFeature, Onboarding])],
	providers: [ClientFeatureResolver]
})
export class OnboardingModule {}
