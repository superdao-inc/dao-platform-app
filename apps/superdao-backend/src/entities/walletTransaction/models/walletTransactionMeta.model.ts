import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ChainId, EcosystemType } from '@sd/superdao-shared';

/**
 * User defined descriptions for transactions
 */
@Entity({ name: 'transaction_metas' })
@ObjectType()
export class WalletTransactionMeta extends BaseEntity {
	@Field(() => ID, { nullable: true })
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String)
	@Column({ type: 'varchar', unique: true })
	hash: string;

	@Field(() => EcosystemType)
	@Column({ type: 'enum', nullable: true, enum: EcosystemType, default: EcosystemType.EVM })
	ecosystem: EcosystemType | null;

	@Field(() => ChainId)
	@Column({ type: 'int', nullable: true })
	chainId: ChainId | null;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar' })
	description: string;
}
