import { Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ethers } from 'ethers';

import { Dao } from 'src/entities/dao/dao.model';
import { IsAddress } from 'src/decorators/address.decorator';
import { ArtworkType } from '../blockchain/types';
import { MetadataAttributesSdTraits } from 'src/types/metadata';

// eslint-disable-next-line no-shadow
export enum TierArtworkTypeStrings {
	one = 'one', // когда 1 артворк, например всего 1000 unit’ов, и все одинаковые
	reveal = 'reveal', // когда неизвестно что там за артворки, покупаешь кота в мешке
	unique = 'unique', // когда артворков много, как и рандом, только юзер может выбирать какую купить
	random = 'random' // когда артворков много, и при покупке они рандомятся, не знаешь какой выпадет
}

registerEnumType(TierArtworkTypeStrings, {
	name: 'TierArtworkTypeStrings'
});

registerEnumType(MetadataAttributesSdTraits, { name: 'MetadataAttributesSdTraits' });

@InputType('NftAttributeInput')
@ObjectType('NftAttribute')
export class NftAttribute {
	@Field(() => String, { nullable: true })
	displayType?: string;

	@Field(() => String, { nullable: true })
	traitType?: string;

	@Field(() => String, { nullable: true })
	sdTrait?: string;

	// @Field(() => MetadataAttributesSdTraits, { nullable: true }) // TODO migrate from String type to Enum for sdTrait field
	// sdTrait?: MetadataAttributesSdTraits;

	@Field(() => String, { nullable: true }) //TODO Create Union type with createUnionType (https://docs.nestjs.com/graphql/unions-and-enums#code-first) for types String | Number | String[] | Boolean
	value?: string | number;
}

@InputType('MultiTypeNftAttributeInput')
@ObjectType('MultiTypeNftAttribute')
export class MultiTypeNftAttribute {
	@Field(() => String, { nullable: true })
	displayType?: string;

	@Field(() => String, { nullable: true })
	traitType?: string;

	@Field(() => String, { nullable: true })
	sdTrait?: string;

	@Field(() => String, { nullable: true })
	valueString?: string;

	@Field(() => Number, { nullable: true })
	valueNumber?: number;
}

@InputType('NftMetadataInput')
@ObjectType('NftMetadata')
export class NftMetadata {
	@Field(() => String, { nullable: true }) //TODO remove id propersy, as there is no such properry in tier's metadata
	id: string;

	@Field(() => String, { nullable: true })
	image: string;

	// @Field(() => String, { nullable: true }) //TODO add name property
	// name: string;

	@Field(() => String, { nullable: true })
	description: string;

	@Field(() => String, { nullable: true })
	animationUrl?: string;

	@Field(() => [NftAttribute], { nullable: true })
	attributes: NftAttribute[];

	@Field(() => String, { nullable: true })
	imageName?: string;

	@Field(() => String, { nullable: true })
	animationUrlName?: string;

	@Field(() => Number, { nullable: true })
	initialSize?: number;

	@Field(() => Number, { nullable: true })
	compressedSize?: number;
}

export type ParsedData<T> = Omit<T, 'metadata'> & {
	metadata?: NftMetadata;
};

// `isAbstract` decorator option is mandatory to prevent registering in schema
@ObjectType({ isAbstract: true })
export abstract class NftBase {
	/**
	 * @description The address of the contract of the NFT
	 * @example 0x057Ec652A4F150f7FF94f089A38008f49a0DF88e
	 */
	@Field(() => String)
	tokenAddress: string;

	/**
	 * @description The token id of the NFT
	 * @example 15
	 */
	@Field(() => String)
	tokenId: string;

	/**
	 * @description The type of NFT contract standard
	 * @example ERC721
	 */
	@Field(() => String)
	contractType: string;

	/** @description The uri to the metadata of the token */
	@Field(() => String, { nullable: true })
	tokenUri: string | null;

	/** @description when the metadata was last updated */
	@Field(() => String, { nullable: true })
	syncedAt: string | null;

	/**
	 * @description The number of this item the user owns (used by ERC1155)
	 * @example 1
	 */
	@Field(() => String, { nullable: true })
	amount: string | null;

	/**
	 * @description The name of the Token contract
	 * @example CryptoKitties
	 */
	@Field(() => String, { nullable: true })
	name: string;

	/**
	 * @description The symbol of the NFT contract
	 * @example RARI
	 */
	@Field(() => String, { nullable: true })
	symbol: string;
}

@ObjectType()
export class EnrichedNft extends NftBase {
	@Field(() => NftMetadata, { nullable: true })
	metadata: NftMetadata | null;

	@Field(() => Dao)
	dao: Dao;
}

@ObjectType()
export class EnrichedNftWithCollectionAddress extends EnrichedNft {
	@Field(() => String, { nullable: true })
	collectionAddress?: string;

	@Field(() => String)
	tierId: string;

	@Field(() => String)
	tierName: string;
}

@ObjectType({ isAbstract: true })
export class NftOwner {
	/**
	 * @description The address of the contract of the NFT
	 * @example 0x057Ec652A4F150f7FF94f089A38008f49a0DF88e
	 */
	@Field(() => String)
	tokenAddress: string;

	/**
	 * @description The native id of nft tier
	 * @example EE7D2BB711D7473F8CDD0BCF91060A1
	 */
	@Field(() => String)
	tierId: string;

	/**
	 * @description The token id of the NFT
	 * @example 15
	 */
	@Field(() => String)
	tokenId: string;

	/**
	 * @description The type of NFT contract standard
	 * @example ERC721
	 */
	@Field(() => String)
	contractType: string;

	/**
	 * @description The address of the owner of the NFT
	 * @example 0x057Ec652A4F150f7FF94f089A38008f49a0DF88e
	 */
	@Field(() => String)
	ownerOf: string;

	/**
	 * @description The blocknumber when the amount or owner changed
	 * @example 88256
	 */
	@Field(() => String)
	blockNumber: string;

	/**
	 * @description The blocknumber when the NFT was minted
	 * @example 88256
	 */
	@Field(() => String)
	blockNumberMinted: string;

	/** @description The uri to the metadata of the token */
	@Field(() => String)
	tokenUri?: string;

	/** @description when the metadata was last updated */
	@Field(() => String)
	syncedAt?: string;

	/**
	 * @description The number of this item the user owns (used by ERC1155)
	 * @example 1
	 */
	@Field(() => String)
	amount?: string;

	@Field(() => String)
	maxAmount?: string;

	/**
	 * @description The name of the Token contract
	 * @example CryptoKitties
	 */
	@Field(() => String)
	name: string;

	/**
	 * @description The symbol of the NFT contract
	 * @example RARI
	 */
	@Field(() => String)
	symbol: string;
}

@ObjectType()
export class EnrichedNftOwner extends NftOwner {
	@Field(() => NftMetadata, { nullable: true })
	metadata: NftMetadata | null;

	@Field(() => Dao)
	dao: Dao;
}

export type Owner = {
	/**
	 * @description The address of the contract of the NFT
	 * @example 0x057Ec652A4F150f7FF94f089A38008f49a0DF88e
	 */
	tokenAddress: string;
	/**
	 * @description The token id of the NFT
	 * @example 15
	 */
	tokenId: string;
	/**
	 * @description The type of NFT contract standard
	 * @example ERC721
	 */
	contractType: string;
	/**
	 * @description The address of the owner of the NFT
	 * @example 0x057Ec652A4F150f7FF94f089A38008f49a0DF88e
	 */
	ownerOf: string;
	/**
	 * @description The blocknumber when the amount or owner changed
	 * @example 88256
	 */
	blockNumber: string;
	/**
	 * @description The blocknumber when the NFT was minted
	 * @example 88256
	 */
	blockNumberMinted: string;
	/** @description The uri to the metadata of the token */
	tokenUri?: string;
	/** @description The metadata of the token */
	metadata?: string;
	/** @description when the metadata was last updated */
	syncedAt?: string;
	/**
	 * @description The number of this item the user owns (used by ERC1155)
	 * @example 1
	 */
	amount?: string;
	/**
	 * @description The name of the Token contract
	 * @example CryptoKitties
	 */
	name: string;
	/**
	 * @description The symbol of the NFT contract
	 * @example RARI
	 */
	symbol: string;
};

@InputType('TotalPriceInput')
@ObjectType('TotalPrice')
export class TotalPrice {
	@Field(() => String)
	openSale: string;

	@Field(() => String)
	whitelistSale: string;
}

@ObjectType('TierSalesActivity')
@InputType('TierSalesActivityInput')
export class TierSalesActivity {
	@Field(() => Boolean)
	openSale: boolean;

	@Field(() => Boolean)
	whitelistSale: boolean;
}

@InputType('NftTierInput')
@ObjectType('NftTier')
export class NftTier {
	@Field(() => String)
	id: string;

	@Field(() => Boolean)
	isDeactivated: boolean;

	@Field(() => String, { nullable: true })
	tierName: string | null;

	@Field(() => String, { nullable: true })
	description: string | null;

	@Field(() => [NftMetadata])
	artworks: NftMetadata[];

	@Field(() => Int)
	artworksTotalLength: number;

	@Field(() => String, { nullable: true })
	currency: string;

	@Field(() => TotalPrice, { nullable: true })
	totalPrice: TotalPrice;

	@Field(() => TierArtworkTypeStrings)
	tierArtworkType: TierArtworkTypeStrings;

	@Field(() => Number)
	maxAmount: number;

	@Field(() => Number)
	totalAmount: number;

	@Field(() => Boolean, { nullable: true })
	isTransferable?: boolean;

	@Field(() => [MultiTypeNftAttribute])
	achievements: MultiTypeNftAttribute[];

	@Field(() => [MultiTypeNftAttribute])
	benefits: MultiTypeNftAttribute[];

	@Field(() => [MultiTypeNftAttribute])
	customProperties: MultiTypeNftAttribute[];

	@Field(() => TierSalesActivity)
	salesActivity: TierSalesActivity;
}

@ObjectType()
export class Collection {
	@Field(() => String)
	collectionAddress: string;

	@Field(() => String)
	name: string;

	@Field(() => String)
	description: string;

	@Field(() => [NftTier])
	tiers: NftTier[];
}

@ObjectType()
export class Owners {
	@Field(() => String)
	id: string | null;

	@Field(() => String, { nullable: true })
	displayName: string | null;

	@Field(() => String, { nullable: true })
	email: string | null;

	@Field(() => String, { nullable: true })
	avatar: string | null;

	@Field(() => String)
	walletAddress: string;

	@Field(() => String, { nullable: true })
	ens: string | null;

	@Field(() => String)
	name: string;

	@Field(() => String)
	tokenId: string;
}

@ObjectType()
export class CollectionTierInfo {
	@Field(() => String)
	id: string;

	@Field(() => Boolean)
	isDeactivated: boolean;

	@Field(() => String, { nullable: true })
	tierName: string | null;

	@Field(() => String, { nullable: true })
	description: string | null;

	@Field(() => [NftMetadata])
	artworks: NftMetadata[];

	@Field(() => Number)
	maxAmount: number;

	@Field(() => TierArtworkTypeStrings)
	tierArtworkType: TierArtworkTypeStrings;

	@Field(() => Number)
	totalAmount: number;

	@Field(() => TotalPrice, { nullable: true })
	totalPrice: TotalPrice;

	@Field(() => String)
	currency: string;

	@Field(() => String)
	collectionAddress: string;

	@Field(() => String)
	collectionName: string;

	@Field(() => [Owners])
	owners: Owners[];

	@Field(() => Int, { nullable: true })
	winterFiatCheckoutProjectId: number | null;
}

@ObjectType()
export class CollectionArtworks {
	@Field(() => [NftMetadata])
	artworks: NftMetadata[];
}

@ObjectType()
export class NftArtwork implements ArtworkType {
	@Field(() => String, { nullable: true })
	id: string;

	@Field(() => String)
	image: string;

	@Field(() => String, { nullable: true })
	animationUrl?: string;
}

@ObjectType()
class BigNumber extends ethers.BigNumber {
	@Field(() => String)
	_hex: string;
	@Field(() => Boolean)
	_isBigNumber: boolean;
}

@ObjectType()
export class CalculatedFee {
	@Field(() => BigNumber)
	maxFeePerGas: BigNumber;
	@Field(() => BigNumber)
	maxPriorityFeePerGas: BigNumber;
	@Field(() => Int)
	gasLimit: number;
}

@InputType('AirdropParticipantInput')
export class AirdropParticipant {
	@Field(() => String)
	@IsAddress()
	walletAddress: string;

	@Field(() => [String])
	tiers: string[];

	@Field()
	email: string;
}

@ObjectType()
export class CheckNftAvailabilityResponse {
	@Field(() => Int)
	availableCount: number;

	@Field(() => Boolean)
	isAvailable: boolean;
}

@ObjectType()
export class GetMintedNftResponse {
	@Field(() => Int, { nullable: true })
	artworkId: number;

	@Field(() => Int, { nullable: true })
	tokenId: number;
}

export type DaosMembersByNftData = { [daoAddress: string]: { walletAddress: string; tiers: string[] }[] };
