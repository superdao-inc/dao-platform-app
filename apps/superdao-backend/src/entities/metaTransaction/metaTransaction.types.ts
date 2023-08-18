import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsAddress } from 'src/decorators/address.decorator';

@ObjectType()
class ForwardRequestType {
	@Field()
	name: string;

	@Field()
	type: string;
}

@ObjectType()
class MetaTxTypes {
	@Field(() => [ForwardRequestType])
	ForwardRequest: ForwardRequestType[];
}

@ObjectType()
class Domain {
	@Field()
	name: string;

	@Field()
	version: string;

	@Field(() => Int)
	chainId: number;

	@Field()
	verifyingContract: string;
}

@ObjectType()
export class MetaTxMessage {
	@Field(() => Int)
	value: number;

	@Field()
	from: string;

	@Field()
	to: string;

	@Field(() => Int)
	nonce: number;

	@Field()
	data: string;
}

@InputType()
export class MetaTxMessageInput {
	@Field(() => Int)
	value: number;

	@Field()
	from: string;

	@Field()
	to: string;

	@Field(() => Int)
	nonce: number;

	@Field()
	data: string;
}

@ObjectType()
export class MetaTxParams {
	@Field()
	primaryType: string;

	@Field(() => MetaTxTypes)
	types: MetaTxTypes;

	@Field(() => Domain)
	domain: Domain;

	@Field(() => MetaTxMessage)
	message: MetaTxMessage;
}

@InputType()
export class GetBanMembersMetaTxParamsInput {
	@Field(() => String)
	@IsAddress()
	daoAddress: string;

	@Field(() => [String])
	tokenIds: string[];
}

@InputType()
export class SendMetaTxParamsInput {
	@Field(() => String)
	signature: string;

	@Field(() => MetaTxMessageInput)
	message: MetaTxMessageInput;
}
