import { IsUUID } from 'class-validator';
import { ArgsType, ID, Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PaginationWithSearch } from 'src/gql/pagination';

import { IsAddress } from 'src/decorators/address.decorator';

// eslint-disable-next-line no-shadow
export enum WhitelistTargetsEnum {
	sale = 'sale',
	emailClaim = 'emailClaim'
}

export enum WhitelistStatusEnum {
	Enabled = 'ENABLED',
	Archived = 'ARCHIVED',
	Disabled = 'DISABLED',
	Used = 'USED'
}

registerEnumType(WhitelistTargetsEnum, {
	name: 'WhitelistTargetsEnum'
});

registerEnumType(WhitelistStatusEnum, {
	name: 'WhitelistStatusEnum'
});

@ArgsType()
export class WhitelistParticipantsRequest extends PaginationWithSearch {
	@Field(() => ID)
	@IsUUID()
	daoId: string;

	@Field(() => WhitelistTargetsEnum)
	target: WhitelistTargetsEnum;
}

@InputType()
export class WhitelistAddWalletInput {
	@Field(() => String)
	transactionHash: string;

	@Field(() => String)
	@IsAddress()
	daoAddress: string;

	@Field(() => [WhitelistParticipant])
	items: WhitelistParticipant[];
}

@InputType('whitelistParticipantInput')
@ObjectType('whitelistParticipantType')
export class WhitelistParticipant {
	@Field(() => String)
	@IsAddress()
	walletAddress: string;

	@Field(() => [String])
	tiers: string[];

	@Field(() => String)
	email: string;
}
@InputType()
export class WhitelistData {
	@Field(() => String)
	@IsAddress()
	daoId: string;

	@Field(() => [WhitelistParticipant])
	items: WhitelistParticipant[];
}
