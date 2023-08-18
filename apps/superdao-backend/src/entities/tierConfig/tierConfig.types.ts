import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType('NftTierConfigInput')
@ObjectType('NftTierConfig')
export class NftTierConfig {
	@Field(() => String)
	id: string;

	@Field(() => String)
	tierId: string;

	@Field(() => String)
	daoAddress: string;

	@Field(() => String)
	collectionAddress: string;

	@Field(() => Boolean)
	isHidden: boolean;

	@Field(() => Number)
	position: number;
}
