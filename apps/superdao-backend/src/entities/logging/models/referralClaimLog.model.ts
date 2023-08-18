import { Column, Entity } from 'typeorm';
import { Field, Int } from '@nestjs/graphql';

import { BaseLog } from './baseLog';

@Entity({ name: 'refferal_claim_transaction_logs' })
export class RefferalClaimLog extends BaseLog {
	@Field(() => String)
	@Column({ type: 'varchar' })
	tier: string;

	@Field(() => String)
	@Column({ type: 'varchar' })
	referralCampaignId: string;

	@Field(() => Int)
	@Column({ type: 'int' })
	linkLimit: number;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true })
	claimSecret: string | null;

	@Field(() => String, { nullable: true })
	@Column({ type: 'varchar', nullable: true })
	referralLinkId: string | null;
}
