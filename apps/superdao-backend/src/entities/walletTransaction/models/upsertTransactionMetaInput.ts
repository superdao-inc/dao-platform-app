import { Field, InputType, Int } from '@nestjs/graphql';
import { EcosystemType } from '@sd/superdao-shared';

@InputType()
export class UpsertTransactionMetaInput {
	@Field(() => String)
	hash: string;

	@Field(() => String)
	walletId: string;

	@Field(() => EcosystemType)
	ecosystem: EcosystemType;

	@Field(() => Int, { nullable: true })
	chainId?: number | null;

	@Field(() => String)
	description: string;
}
