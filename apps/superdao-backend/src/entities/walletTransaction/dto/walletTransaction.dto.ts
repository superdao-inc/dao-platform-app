import { ArgsType, Field, Int } from '@nestjs/graphql';
import { ChainId } from '@sd/superdao-shared';

@ArgsType()
export class WalletTransactionArgs {
	@Field(() => String)
	address: string;

	@Field(() => Int, { nullable: true, defaultValue: ChainId.POLYGON_MAINNET })
	chainId: number;

	@Field(() => String)
	hash: string;
}
