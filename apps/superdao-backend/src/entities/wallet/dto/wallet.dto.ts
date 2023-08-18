import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class GetWalletArgs {
	@Field(() => String)
	id: string;
}
