import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsAddress } from 'src/decorators/address.decorator';
import { NftTier } from 'src/entities/nft/nft.types';
import { NftTierConfig } from '../tierConfig/tierConfig.types';
import { SaleType } from '@sd/superdao-shared';

@ObjectType()
export class NftAdminCollectionResponse {
	@Field(() => String)
	name: string;

	@Field(() => String, { nullable: true })
	collectionAddress: string | null;

	@Field(() => String)
	symbol: string;

	@Field(() => String)
	description: string;

	@Field(() => String)
	externalLink: string;

	@Field(() => Number)
	sellerFeeBasisPoints: number;

	@Field(() => String)
	@IsAddress()
	feeRecipient: string;

	@Field(() => [NftTierConfig])
	tierConfigs: NftTierConfig[];

	@Field(() => [ExtendedNftTier])
	tiers: ExtendedNftTier[];

	@Field(() => String)
	erc721semver: string;
}

@InputType('ExtendedNftTierInput')
@ObjectType('ExtendedNftTier')
export class ExtendedNftTier extends NftTier {
	@Field(() => Boolean)
	hasRandomShuffleMint: boolean;

	@Field(() => Boolean)
	isRandom: boolean;

	@Field(() => Boolean)
	isTransferable: boolean;

	@Field(() => Number, { description: 'Date.getTime value in milliseconds' })
	transferUnlockDate: number;
}

@InputType()
export class NftAdminUpdateCollectionTxInput {
	@Field(() => String)
	name: string;

	@Field(() => String)
	symbol: string;

	@Field(() => String)
	description: string;

	@Field(() => String)
	externalLink: string;

	@Field(() => Number)
	sellerFeeBasisPoints: number;

	@Field(() => String)
	@IsAddress()
	feeRecipient: string;

	@Field(() => [ExtendedNftTier])
	tiers: ExtendedNftTier[];

	@Field(() => [NftTierConfig])
	tierConfigs: NftTierConfig[];
}

@InputType()
export class NftAdminUpdateCollectionInput {
	@Field(() => String)
	transactionHash: string;

	@Field(() => String)
	@IsAddress()
	daoAddress: string;
}

@ObjectType('TierWithPrices')
@InputType('TierWithPricesInput')
export class TierWithPrices {
	@Field(() => String, { nullable: true })
	id?: string;

	@Field(() => String)
	name: string;

	@Field(() => Number, { nullable: true })
	price?: number;

	@Field(() => Boolean)
	active: boolean;

	@Field(() => Number)
	tierLimits: number;
}

@ObjectType('SaleConfig')
@InputType('SaleConfigInput')
export class SaleConfig {
	@Field(() => [TierWithPrices])
	prices: TierWithPrices[];

	@Field(() => Boolean)
	isActive: boolean;

	@Field(() => String)
	token: string;

	@Field(() => String)
	@IsAddress()
	treasuryWallet: string;

	@Field(() => Number)
	claimLimit: number;

	@Field(() => Number)
	totalClaimsLimit: number;

	@Field(() => Number)
	timeStart: number;

	@Field(() => Number)
	timeEnd: number;
}

registerEnumType(SaleType, {
	name: 'SaleType',
	description: 'Type of sale'
});

@ObjectType('NftAdminUpdateSaleTx')
@InputType('NftAdminUpdateSaleTxInput')
export class NftAdminUpdateSaleTx {
	@Field(() => String)
	daoAddress: string;

	@Field(() => SaleType)
	type: SaleType;

	@Field(() => SaleConfig)
	options: SaleConfig;
}

@InputType()
export class NftAdminUpdateSaleInput {
	@Field(() => String)
	transactionHash: string;

	@Field(() => String)
	@IsAddress()
	daoAddress: string;

	@Field(() => SaleType)
	type: SaleType;
}
