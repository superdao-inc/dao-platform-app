import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { RoadmapLevel } from '../achievements.types';

@InputType()
export class UpdateSchemaInput {
	@Field(() => ID)
	@IsUUID()
	daoId: string;

	@Field(() => [RoadmapLevel])
	levels: RoadmapLevel[];
}
