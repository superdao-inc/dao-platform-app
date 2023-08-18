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
import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { DaoMembership } from 'src/entities/daoMembership/daoMembership.model';
import { Post } from 'src/entities/post/post.model';
import { Whitelist } from 'src/entities/whitelist/whitelist.model';

import { DaoMode, Document, TierVotingWeight } from 'src/entities/dao/dao.types';
import { Proposal } from 'src/entities/proposal/proposal.model';
import { DaoAnalytics } from 'src/entities/daoAnalytics/daoAnalytics.model';
import { Wallet } from 'src/entities/wallet/wallet.model';
import { ReferralCampaign } from '../referral/models/referralCampaign.model';
import { Links } from '../links/links.model';
import { RoadmapLevel } from '../achievements/achievements.types';

export type CustomEmailKey = 'owl_dao';

@Entity({ name: 'daos' })
@ObjectType()
@InputType('DaoInput')
export class Dao extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', unique: true, nullable: true, default: null })
	contractAddress: string | null;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', unique: false, nullable: true, default: null })
	openseaUrl: string | null;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true, default: null })
	ensDomain: string | null;

	@Field(() => Boolean)
	@Column({ type: 'boolean', default: false })
	isVotingEnabled: boolean;

	@Field(() => Boolean)
	@Column({ type: 'boolean', default: false })
	isClaimEnabled: boolean;

	@Field(() => String)
	@Column({ type: 'varchar' })
	name: string;

	@Field(() => String)
	@Column({ type: 'text' })
	description: string;

	@Field(() => String)
	@Column({ type: 'varchar', unique: true })
	slug: string;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true })
	avatar: string | null;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true })
	cover: string | null;

	@Field(() => Links)
	@OneToOne(() => Links, { eager: true })
	@JoinColumn()
	links: Links;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true })
	whitelistUrl: string | null;

	@Field(() => Int)
	@Column({ type: 'int', default: 0 })
	membersCount: number;

	@Field(() => [Document])
	@Column({ type: 'json', default: [] })
	documents: Document[];

	@Field(() => [TierVotingWeight])
	@Column({ type: 'json', default: [] })
	tiersVotingWeights: TierVotingWeight[];

	@OneToMany(() => Post, (post) => post.dao, { onDelete: 'CASCADE' })
	posts: Post[];

	@OneToMany(() => DaoMembership, (daoMembership) => daoMembership.dao, { onDelete: 'CASCADE' })
	daoMembership: DaoMembership[];

	@Column({ nullable: true, type: 'varchar' })
	customEmailKey: CustomEmailKey | null;

	@Field(() => String, { nullable: true })
	@Column({ nullable: true, type: 'varchar' })
	supportChatUrl: string | null;

	@OneToMany(() => Wallet, (wallet: Wallet) => wallet.dao)
	wallets: Wallet[];

	@OneToMany(() => Whitelist, (whitelist) => whitelist.dao)
	whitelists: Whitelist[];

	@OneToMany(() => ReferralCampaign, (referralCampaing) => referralCampaing.dao, { onDelete: 'CASCADE' })
	referralCampaings: ReferralCampaign[];

	@OneToMany(() => Proposal, (proposal) => proposal.dao, { onDelete: 'CASCADE' })
	proposals: Proposal[];

	@OneToOne(() => DaoAnalytics, (daoAnalytics) => daoAnalytics.dao)
	analytics: DaoAnalytics;

	@Field(() => Boolean)
	@Column({ type: 'boolean', default: false })
	hasDemoProposals: boolean;

	@Field(() => Boolean)
	@Column({ type: 'boolean', default: false })
	hasShortSlugAccess: boolean;

	@Field()
	@Column({ nullable: false, type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;

	@Field(() => Int)
	@Column({ nullable: true, type: 'float' })
	treasuryValue: number | null;

	@Field(() => Boolean)
	@Column({ type: 'boolean', default: false })
	claimDeployDao: boolean;

	@Field(() => Boolean)
	@Column({ type: 'boolean', default: false })
	isInternal: boolean;

	@Field(() => Int, { nullable: true })
	@Column({ type: 'int', nullable: true, default: null, unique: true })
	winterFiatCheckoutProjectId: number | null;

	@Field(() => [RoadmapLevel])
	@Column({ type: 'json', default: [] })
	achievementsRoadmapLevels: RoadmapLevel[];

	@Field(() => DaoMode)
	@Column({ type: 'enum', nullable: false, enum: DaoMode, default: DaoMode.DEFAULT })
	mode: DaoMode;
}

/**
 * @deprecated Use nest repository injection https://docs.nestjs.com/techniques/database#repository-pattern
 */
export const daoRepository = () => getRepository(Dao);
