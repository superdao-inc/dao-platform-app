import { Field, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { IsAddress } from 'src/decorators/address.decorator';

@InputType()
export class WhitelistRemoveWalletInput {
	@Field(() => String)
	@IsUUID()
	userId: string;

	@Field(() => String)
	transactionHash: string;

	@Field(() => String)
	@IsAddress()
	daoAddress: string;
}
