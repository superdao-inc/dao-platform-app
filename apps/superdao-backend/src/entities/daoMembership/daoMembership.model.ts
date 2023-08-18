import {
	BaseEntity,
	Column,
	Entity,
	getRepository,
	ManyToOne,
	OneToOne,
	PrimaryGeneratedColumn,
	Unique
} from 'typeorm';
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

// types
import { DaoMemberRole } from './daoMembership.types';

// entities
import { Dao } from 'src/entities/dao/dao.model';
import { User } from 'src/entities/user/user.model';
import { ReferralMember } from '../referral/models/referralMember.model';

@Entity({ name: 'dao_membership' })
@Unique(['daoId', 'userId'])
@ObjectType()
@InputType('DaoMembershipInput')
export class DaoMembership extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String)
	@Column({ type: 'uuid' })
	daoId: string;

	@Field(() => String)
	@Column({ type: 'uuid' })
	userId: string;

	@Field(() => DaoMemberRole)
	@Column({ type: 'enum', enum: DaoMemberRole, default: DaoMemberRole.Member })
	role: DaoMemberRole;

	@Field(() => [String])
	@Column('varchar', { array: true, default: [] })
	tiers: string[];

	@ManyToOne(() => Dao, (dao) => dao.daoMembership, { onDelete: 'CASCADE' })
	dao: Dao;

	@ManyToOne(() => User, (user) => user.daoMembership)
	user: User;

	@OneToOne(() => ReferralMember, (referralMember) => referralMember.daoMembership)
	@Field(() => ReferralMember, { nullable: true })
	referralMember: ReferralMember | null;

	@Field()
	@Column({ nullable: false, type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;
}

/**
 * @deprecated Use nest repository injection https://docs.nestjs.com/techniques/database#repository-pattern
 */
export const daoMembershipRepository = () => getRepository(DaoMembership);
