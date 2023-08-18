import { ArgsType, Field } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { IsAddress } from 'src/decorators/address.decorator';
import { WhitelistParticipant } from 'src/entities/whitelist/whitelist.types';

@ArgsType()
export class WhitelistAddWalletsTxInput {
	@Field(() => String)
	@IsAddress()
	daoAddress: string;

	@Field(() => [WhitelistParticipant])
	whitelist: WhitelistParticipant[];
}

@ArgsType()
export class WhitelistRemoveWalletsTxInput {
	@Field(() => String)
	@IsUUID()
	userId: string;

	@Field(() => String)
	@IsAddress()
	daoAddress: string;
}
