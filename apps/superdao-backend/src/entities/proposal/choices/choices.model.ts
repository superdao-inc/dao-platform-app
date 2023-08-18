import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { CHOICE_CONTENT_MAX_LENGTH } from '@sd/superdao-shared';

import { Proposal } from 'src/entities/proposal/proposal.model';

@Entity({ name: 'choices' })
@ObjectType()
@InputType('ChoiceInput')
export class Choice extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String)
	@Column({ type: 'varchar', length: CHOICE_CONTENT_MAX_LENGTH, update: false })
	name: string;

	@Field(() => Proposal)
	@ManyToOne(() => Proposal, (proposal) => proposal.choices, { onDelete: 'CASCADE' })
	proposal: Proposal;
}
