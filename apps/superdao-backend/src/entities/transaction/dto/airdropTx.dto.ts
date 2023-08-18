import { ArgsType, Field } from '@nestjs/graphql';
import { IsAddress } from 'src/decorators/address.decorator';
import { AirdropParticipant } from 'src/entities/nft/nft.types';

@ArgsType()
export class AirdropTxInput {
	@Field(() => String)
	@IsAddress()
	daoAddress: string;

	@Field(() => [AirdropParticipant])
	items: AirdropParticipant[];
}
