import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NftOpenseaMetadataAttribute {
	@Field(() => String, { nullable: true })
	displayType?: string;

	@Field(() => String, { nullable: true })
	traitType?: string;

	@Field(() => String, { nullable: true })
	sdTrait?: string;

	@Field(() => String)
	value: string;
}

@ObjectType()
export class NftOpenseaMetadata {
	@Field(() => String, { nullable: true })
	image?: string;

	@Field(() => String, { nullable: true })
	externalUrl?: string;

	@Field(() => String, { nullable: true })
	description?: string;

	@Field(() => String, { nullable: true })
	name?: string;

	@Field(() => String, { nullable: true })
	animationUrl?: string;

	@Field(() => String, { nullable: true })
	youtubeUrl?: string;

	@Field(() => String, { nullable: true })
	backgroundColor?: string;

	@Field(() => [NftOpenseaMetadataAttribute], { nullable: true })
	attributes?: NftOpenseaMetadataAttribute[];
}

@ObjectType()
export class NftInfo {
	@Field(() => String)
	id: string;

	@Field(() => String)
	tokenAddress: string;

	@Field(() => String)
	tokenId: string;

	@Field(() => String)
	contractType: string;

	@Field(() => String)
	ownerOf: string;

	@Field(() => String)
	blockNumber: string;

	@Field(() => String)
	blockNumberMinted: string;

	@Field(() => String, { nullable: true })
	tokenUri?: string;

	@Field(() => NftOpenseaMetadata, { nullable: true })
	metadata?: NftOpenseaMetadata;

	@Field(() => String, { nullable: true })
	syncedAt?: string;

	@Field(() => String, { nullable: true })
	amount?: string;

	@Field(() => String)
	name: string;

	@Field(() => String, { nullable: true })
	symbol: string;

	@Field(() => Boolean)
	isPublic: boolean;
}

@ObjectType()
export class NftTransferableInfo {
	@Field(() => String)
	id: string;

	@Field(() => Boolean, { nullable: true })
	isTransferable?: boolean;
}
