import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

@Entity({ name: 'tier_config' })
@ObjectType()
@InputType('TierConfigInput')
@Unique(['collectionAddress', 'tierId'])
export class TierConfig extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String)
	@Column({ type: 'varchar', nullable: false })
	tierId: string;

	@Field(() => String)
	@Column({ type: 'varchar', nullable: false })
	daoAddress: string;

	@Field(() => String)
	@Column({ type: 'varchar', nullable: false })
	collectionAddress: string;

	@Field(() => Boolean)
	@Column({ type: 'boolean', default: false })
	isHidden: boolean;

	@Field(() => Boolean)
	@Column({ type: 'int', nullable: true, default: null })
	position: number;

	@Field()
	@Column({ nullable: false, type: 'timestamptz', default: () => 'NOW()' })
	updatedAt: Date;

	@Field()
	@Column({ nullable: false, type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;
}
