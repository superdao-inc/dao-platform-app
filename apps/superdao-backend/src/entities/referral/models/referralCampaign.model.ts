import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

import { Dao } from '../../dao/dao.model';
import { ReferralLink } from './referralLink.model';

@Entity({ name: 'referral_campaign' })
@Unique(['shortId'])
@ObjectType()
export class ReferralCampaign extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => ID)
	@Column({ type: 'varchar' })
	shortId: string;

	@Field(() => String)
	@Column({ type: 'uuid' })
	daoId: string;

	@ManyToOne(() => Dao, (dao) => dao.referralCampaings)
	dao: Dao;

	@OneToMany(() => ReferralLink, (referralLink) => referralLink.referralCampaign)
	referralLinks: ReferralLink[];

	@Field(() => String)
	@Column({ type: 'varchar' })
	tier: string;

	@Field()
	@Column({ type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;

	@Field(() => Number)
	@Column({ type: 'int', default: 100 })
	defaultLimit: number;

	@Field(() => Boolean)
	@Column({ type: 'boolean', default: false })
	isRecursive: boolean;
}
