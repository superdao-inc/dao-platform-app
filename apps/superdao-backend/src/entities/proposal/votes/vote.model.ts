import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Proposal } from 'src/entities/proposal/proposal.model';
import { User } from 'src/entities/user/user.model';

@Entity({ name: 'votes' })
@ObjectType('VoteModel')
@InputType('VoteInput')
export class Vote extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => Int)
	@Column({ type: 'int', default: 1, update: false })
	power: number;

	@Field(() => Proposal)
	@ManyToOne(() => Proposal, (proposal) => proposal.votes, { onDelete: 'CASCADE' })
	proposal: Proposal;

	@Field(() => String)
	@Column({ type: 'uuid', update: false })
	choiceId: string;

	@Field(() => User)
	@ManyToOne(() => User, (user) => user.votes)
	user: User;

	@Field()
	@Column({ nullable: false, type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;
}
