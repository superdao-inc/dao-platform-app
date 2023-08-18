import { Column, Entity } from 'typeorm';
import { Field } from '@nestjs/graphql';

import { AirdropParticipant } from 'src/entities/nft/nft.types';

import { BaseLog } from './baseLog';

@Entity({ name: 'airdrop_transaction_logs' })
export class AirdropLog extends BaseLog {
	@Field(() => [AirdropParticipant])
	@Column({ type: 'json', default: [] })
	participants: AirdropParticipant[];
}
