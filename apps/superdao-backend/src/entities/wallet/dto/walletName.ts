import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WalletName {
	@Field(() => String)
	name: String;

	@Field(() => String)
	address: String;
}
