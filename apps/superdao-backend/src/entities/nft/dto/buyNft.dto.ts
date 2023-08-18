import { Field, InputType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

import { IsAddress } from 'src/decorators/address.decorator';

@InputType()
export class BuyNftOpenSaleInput {
	@Field(() => String)
	transactionHash: string;

	@Field(() => String, { nullable: true })
	@IsEmail()
	email: string;

	@Field(() => String)
	@IsAddress()
	daoAddress: string;

	@Field(() => String)
	tier: string;
}

@InputType()
export class BuyNftWhitelistSaleInput {
	@Field(() => String)
	transactionHash: string;

	@Field(() => String)
	@IsEmail()
	email: string;

	@Field(() => String)
	@IsAddress()
	daoAddress: string;

	@Field(() => String)
	tier: string;
}
