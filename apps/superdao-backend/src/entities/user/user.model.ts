import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import {
	BaseEntity,
	Column,
	Entity,
	getRepository,
	JoinColumn,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn
} from 'typeorm';
import { DaoMembership } from 'src/entities/daoMembership/daoMembership.model';
import { UserNotification } from 'src/entities/userNotification/userNotification.model';
import { Onboarding } from '../onboarding/onboarding.model';
import { Vote } from '../proposal/votes/vote.model';
import { Links } from '../links/links.model';
import { UserWalletType } from 'src/entities/user/user.types';

@Entity({ name: 'users' })
@ObjectType()
@InputType('UserInput')
export class User extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String)
	@Column({ type: 'varchar', unique: true })
	walletAddress: string;

	@Field(() => UserWalletType)
	@Column({ type: 'enum', enum: UserWalletType, default: UserWalletType.METAMASK })
	walletType: UserWalletType;

	@Field()
	@Column({ type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true })
	ens: string | null;

	@Field(() => String)
	@Column({ type: 'varchar', default: '' })
	nonce: string;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true })
	displayName: string | null;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true, unique: true })
	slug: string | null;

	@Field(() => String, { nullable: true })
	@Column({ type: 'text', nullable: true })
	bio: string | null;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true })
	email: string | null;

	@Field(() => Boolean)
	@Column({ type: 'bool', default: false })
	emailVerified: boolean;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true, default: null })
	avatar: string | null;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true, default: null })
	cover: string | null;

	@Field(() => Links)
	@OneToOne(() => Links, { eager: true })
	@JoinColumn()
	links: Links;

	@Field(() => Boolean)
	@Column({ type: 'bool', default: false })
	hasBetaAccess: boolean;

	@Field(() => Boolean)
	@Column({ type: 'bool', default: false })
	isClaimed: boolean;

	@Field(() => Boolean)
	@Column({ type: 'bool', default: false })
	isSupervisor: boolean;

	@OneToMany(() => DaoMembership, (daoMembership) => daoMembership.user)
	daoMembership: DaoMembership[];

	@OneToMany(() => UserNotification, (notifications) => notifications.user)
	notifications: UserNotification[];

	@Field(() => Onboarding, { nullable: true })
	@OneToOne(() => Onboarding, { eager: true, nullable: true })
	@JoinColumn()
	onboarding: Onboarding | null;

	@Field(() => [Vote])
	@OneToMany(() => Vote, (vote) => vote.user)
	votes: Vote[];

	@Field(() => Boolean)
	@Column({ type: 'bool', default: false })
	hasCookieDecision: boolean;

	@Field(() => Boolean)
	@Column({ type: 'bool', default: false })
	agreedWithCookie: boolean;
}

/**
 * @deprecated Use nest repository injection https://docs.nestjs.com/techniques/database#repository-pattern
 */
export const userRepository = () => getRepository(User);
