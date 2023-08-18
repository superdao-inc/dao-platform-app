import { ArgsType, Field } from '@nestjs/graphql';
import { IsAddress } from 'src/decorators/address.decorator';

@ArgsType()
export class BuyNftOpenSaleTxInput {
	@Field(() => String)
	@IsAddress()
	daoAddress: string;

	@Field(() => String)
	toAddress: string;

	@Field(() => String)
	tier: string;
}

@ArgsType()
export class BuyNftWhitelistSaleTxInput {
	@Field(() => String)
	@IsAddress()
	daoAddress: string;

	@Field(() => String)
	toAddress: string;

	@Field(() => String)
	tier: string;
}

@ArgsType()
export class BuyNftMulticurrencyOpenSaleTxInput {
	@Field(() => String)
	@IsAddress()
	daoAddress: string;

	@Field(() => String)
	tier: string;

	@Field(() => String)
	@IsAddress()
	tokenAddress: string;
}

@ArgsType()
export class AllowanceTransactionInput {
	@Field(() => String)
	@IsAddress()
	daoAddress: string;

	@Field(() => String)
	@IsAddress()
	tokenAddress: string;

	@Field(() => String)
	tier: string;

	@Field(() => String)
	transactionHash: string;
}
