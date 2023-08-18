import { Column, Entity } from 'typeorm';
import { Field } from '@nestjs/graphql';

import { BaseLog } from './baseLog';

@Entity({ name: 'claim_nft_transaction_logs' })
export class ClaimNftLog extends BaseLog {
	@Field(() => String)
	@Column({ type: 'varchar' })
	tier: string;

	@Field(() => String)
	@Column({ type: 'varchar' })
	createdDaoSLug: string;

	@Field(() => Boolean)
	@Column({ type: 'boolean', default: false })
	isLinkClaim: boolean;
}
