import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Dao } from '../dao/dao.model';
import { WhitelistStatusEnum, WhitelistTargetsEnum } from './whitelist.types';

@Entity({ name: 'whitelists' })
@ObjectType()
export class Whitelist extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String)
	@Column({ type: 'uuid' })
	daoId: string;

	@Field(() => String)
	@Column({ type: 'varchar' })
	walletAddress: string;

	@Field(() => String)
	@Column({ type: 'varchar', default: '' })
	email: string;

	@Field(() => [String])
	@Column('varchar', { array: true, default: [] })
	tiers: string[];

	@Field(() => String)
	@Column({ type: 'varchar', default: WhitelistTargetsEnum.sale })
	target: string;

	@Field()
	@Column({ type: 'timestamptz', default: () => 'NOW()' })
	addedAt: Date;

	@Field(() => WhitelistStatusEnum)
	@Column({ type: 'enum', enum: WhitelistStatusEnum, default: WhitelistStatusEnum.Enabled })
	status: WhitelistStatusEnum;

	@ManyToOne(() => Dao, (dao) => dao.whitelists)
	dao: Dao;
}
