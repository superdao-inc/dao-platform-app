import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Proposal } from 'src/entities/proposal/proposal.model';

@Entity({ name: 'scores' })
@ObjectType()
@InputType('ScoreInput')
export class Score extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String)
	@Column({ type: 'uuid', update: false })
	choiceId: string;

	@Field(() => Int)
	@Column({ type: 'int', default: 0 })
	value: string;

	@Field(() => Proposal)
	@ManyToOne(() => Proposal, (proposal) => proposal.scores, { onDelete: 'CASCADE' })
	proposal: Proposal;
}
