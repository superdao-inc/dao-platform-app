import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { RoadmapLevel } from '../achievements.types';

@InputType()
export class RoadmapBonusInput {
	@Field()
	title: string;

	@Field()
	description: string;

	@Field()
	image: string;
}

@InputType()
export class RoadmapLevelInput {
	@Field()
	xpNeeded: number;

	@Field(() => [RoadmapBonusInput])
	bonuses: RoadmapBonusInput[];
}

@InputType()
export class UpdateRoadmapInput {
	@Field(() => ID)
	@IsUUID()
	daoId: string;

	@Field(() => [RoadmapLevel])
	levels: RoadmapLevelInput[];
}
