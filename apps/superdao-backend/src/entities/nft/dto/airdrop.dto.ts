import { Field, InputType } from '@nestjs/graphql';
import { IsAddress } from 'src/decorators/address.decorator';
import { AirdropParticipant } from '../nft.types';

@InputType()
export class AirdropInput {
	@Field(() => String)
	transactionHash: string;

	@Field(() => String)
	@IsAddress()
	daoAddress: string;

	@Field(() => [AirdropParticipant])
	items: AirdropParticipant[];

	@Field()
	isGasless: boolean;
}
