import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';

import { ReferralLinkStatus } from '../referral.types';
import { ReferralMember } from './referralMember.model';
import { ReferralCampaign } from './referralCampaign.model';

@Entity({ name: 'referral_link' })
@Unique(['shortId'])
@ObjectType()
export class ReferralLink extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => ID)
	@Column({ type: 'varchar' })
	shortId: string;

	@Field(() => String)
	@Column({ type: 'uuid' })
	referralCampaignId: string;

	@ManyToOne(() => ReferralCampaign, (referralCampaign) => referralCampaign.referralLinks)
	@Field(() => ReferralCampaign)
	referralCampaign: ReferralCampaign;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true })
	ambassadorWallet: string | null;

	@Field(() => Number)
	@Column({ type: 'int' })
	limit: number;

	@Field(() => Number)
	@Column({ type: 'int' })
	limitLeft: number;

	@Field(() => String)
	@Column({ type: 'varchar', default: ReferralLinkStatus.active })
	status: string;

	@OneToMany(() => ReferralMember, (referralMember) => referralMember.referralLink)
	referralMembers: ReferralMember;

	@Field()
	@Column({ type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;
}
