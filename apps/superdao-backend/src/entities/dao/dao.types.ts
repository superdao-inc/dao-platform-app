import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';

@InputType('DocumentInput')
@ObjectType('ObjectInput')
export class Document {
	@Field(() => String)
	name: string;

	@Field(() => String)
	url: string;
}

@InputType('TierVotingWeightInput')
@ObjectType('TierVotingWeightObject')
export class TierVotingWeight {
	@Field(() => String)
	tierId: string;

	@Field(() => Number, { defaultValue: 1 })
	weight: number;
}

@ObjectType()
export class CheckSlugResponse {
	@Field(() => Boolean)
	isAvailable: boolean;

	@Field(() => String)
	nextAvailable: string;
}

@ObjectType()
export class DaoSales {
	@Field(() => Boolean, { nullable: true })
	ERC721_WHITELIST_SALE: boolean;

	@Field(() => Boolean, { nullable: true })
	ERC721_OPEN_SALE: boolean;
}

@ObjectType()
export class DaoSalesResponse {
	@Field(() => DaoSales, { nullable: true })
	sales: DaoSales;
}

@ObjectType()
export class DaoSalesBlockchainApiData {
	@Field(() => String, { nullable: true })
	ERC721_WHITELIST_SALE: string;

	@Field(() => String, { nullable: true })
	ERC721_OPEN_SALE: string;
}

@ObjectType()
export class DaoSalesBlockchainApiResponse {
	@Field(() => DaoSalesBlockchainApiData, { nullable: true })
	sales: DaoSalesBlockchainApiData;
}

export type CheckSlugResult = {
	isAvailable: boolean;
	nextAvailable: string;
};

export enum DaoMode {
	DEFAULT = 'default',
	ACHIEVEMENTS = 'achievements'
}
registerEnumType(DaoMode, {
	name: 'DaoMode',
	description: 'Dao mode'
});
