import { Column, Entity } from 'typeorm';
import { Field } from '@nestjs/graphql';

import { BaseLog } from './baseLog';

@Entity({ name: 'buy_nft_transaction_logs' })
export class BuyNftLog extends BaseLog {
	@Field(() => String)
	@Column({ type: 'varchar' })
	tier: string;

	@Field(() => Boolean)
	@Column({ type: 'boolean', default: false })
	isWhitelist: boolean;
}
