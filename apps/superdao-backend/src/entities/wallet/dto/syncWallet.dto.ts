import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class SyncWalletArgs {
	@Field(() => String)
	address: string;
}
