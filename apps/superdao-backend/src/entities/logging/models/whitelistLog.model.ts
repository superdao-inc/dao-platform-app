import { Column, Entity } from 'typeorm';
import { Field } from '@nestjs/graphql';

import { WhitelistParticipant } from 'src/entities/whitelist/whitelist.types';

import { BaseLog } from './baseLog';

@Entity({ name: 'whitelist_transaction_logs' })
export class WhitelistLog extends BaseLog {
	@Field(() => [WhitelistParticipant])
	@Column({ type: 'json', default: [] })
	participants: WhitelistParticipant[];
}
