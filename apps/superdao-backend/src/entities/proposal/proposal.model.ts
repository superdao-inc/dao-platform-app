import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Vote } from 'src/entities/proposal/votes/vote.model';
import { ProposalVotingPowerType, ProposalVotingType } from 'src/entities/proposal/proposal.types';
import { Dao } from 'src/entities/dao/dao.model';
import { Choice } from 'src/entities/proposal/choices/choices.model';
import { Score } from 'src/entities/proposal/scores/scores.model';

@Entity({ name: 'proposals' })
@ObjectType()
@InputType('ProposalInput')
export class Proposal extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String)
	@Column({ type: 'varchar' })
	title: string;

	@Field(() => String)
	@Column({ type: 'text' })
	description: string;

	@Field(() => Boolean)
	@Column({ type: 'boolean', default: false })
	createdBySuperdao: boolean;

	@Field(() => String, { nullable: true })
	@Column({ type: 'uuid', nullable: true })
	attachment: string | null;

	@Field(() => Int)
	@Column({ type: 'int', default: 0 })
	edition: number;

	@Field(() => ProposalVotingType)
	@Column({
		nullable: false,
		type: 'enum',
		enum: ProposalVotingType
	})
	votingType: ProposalVotingType;

	@Field(() => ProposalVotingPowerType)
	@Column({
		nullable: false,
		type: 'enum',
		enum: ProposalVotingPowerType,
		default: ProposalVotingPowerType.single
	})
	votingPowerType: ProposalVotingPowerType;

	@Field()
	@Column({ type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;

	@Field()
	@Column({ type: 'timestamptz' })
	startAt: Date;

	@Field()
	@Column({ type: 'timestamptz' })
	endAt: Date;

	@Field(() => [Vote])
	@OneToMany(() => Vote, (vote) => vote.proposal)
	votes: Vote[];

	@Field(() => [Choice])
	@OneToMany(() => Choice, (choice) => choice.proposal)
	choices: Choice[];

	@Field(() => [Score])
	@OneToMany(() => Score, (score) => score.proposal)
	scores: Score[];

	@Field(() => Dao)
	@ManyToOne(() => Dao, (dao) => dao.proposals, { onDelete: 'CASCADE' })
	dao: Dao;
}
