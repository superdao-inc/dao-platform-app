import { BaseEntity, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';
import { Field } from '@nestjs/graphql';

export class BaseLog extends BaseEntity {
	@Field(() => String)
	@PrimaryColumn({ type: 'varchar' })
	transactionHash: string;

	@Field(() => String)
	@Column({ type: 'varchar' })
	executorId: string;

	@Field(() => String)
	@Column({ type: 'varchar' })
	daoAddress: string;

	@Field()
	@CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;

	@Field(() => Date, { nullable: true })
	@Column({ type: 'timestamptz', nullable: true, default: null })
	succededAt: Date | null;

	@Field(() => Date, { nullable: true })
	@Column({ type: 'timestamptz', nullable: true, default: null })
	failedAt: Date | null;
}
