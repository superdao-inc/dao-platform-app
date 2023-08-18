import { ArgsType, Field } from '@nestjs/graphql';
import { IsAddress } from 'src/decorators/address.decorator';

@ArgsType()
export class DeleteNftTierTxInput {
	@Field(() => String)
	@IsAddress()
	daoAddress: string;

	@Field(() => String)
	@IsAddress()
	erc721CollectionAddress: string;

	@Field(() => String)
	tier: string;
}
