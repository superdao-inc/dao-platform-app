import { Column, Entity } from 'typeorm';
import { Field } from '@nestjs/graphql';

import { BaseLog } from './baseLog';

@Entity({ name: 'ban_transaction_logs' })
export class BanLog extends BaseLog {
	@Field(() => String)
	@Column({ type: 'varchar' })
	bannedAddress: string;

	@Field(() => Boolean)
	@Column({ type: 'bool', default: false })
	isBurnCase: boolean;
}
