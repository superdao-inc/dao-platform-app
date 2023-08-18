import { BaseEntity, Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { ReferralLink } from './referralLink.model';
import { DaoMembership } from '../../daoMembership/daoMembership.model';

@Entity({ name: 'referral_member' })
@ObjectType()
@InputType('ReferralMemberInput')
export class ReferralMember extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String)
	@Column({ type: 'uuid' })
	referralLinkId: string;

	@ManyToOne(() => ReferralLink, (referralLink) => referralLink.referralMembers)
	referralLink: ReferralLink;

	@Field(() => String)
	@Column({ type: 'uuid' })
	daoMembershipId: string;

	@OneToOne(() => DaoMembership, (daoMembership) => daoMembership.referralMember)
	daoMembership: DaoMembership;

	@Field()
	@Column({ type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;
}
