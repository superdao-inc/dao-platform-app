import { IsUUID } from 'class-validator';
import { ArgsType, Field } from '@nestjs/graphql';
import { IsAddress } from 'src/decorators/address.decorator';

@ArgsType()
export class BanMemberTx {
	@Field(() => String)
	@IsUUID()
	userId: string;

	@Field(() => String)
	@IsAddress()
	daoAddress: string;

	@Field(() => [String])
	tokenIds: string[];
}
