import { ethers } from 'ethers';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AccessListItem {
	@Field()
	address: string;

	@Field(() => [String])
	storageKeys: string[];
}

@ObjectType()
export class JsonBignumber {
	@Field()
	type: 'BigNumber';

	@Field(() => String)
	hex: string;
}

@ObjectType()
export class TransactionType
	implements Omit<ethers.Transaction, 'gasLimit' | 'gasPrice' | 'value' | 'maxPriorityFeePerGas' | 'maxFeePerGas'>
{
	@Field({ nullable: true })
	hash?: string;

	@Field({ nullable: true })
	to?: string;

	@Field({ nullable: true })
	from?: string;

	@Field({ nullable: true })
	nonce: number;

	@Field(() => JsonBignumber, { nullable: true })
	gasLimit: JsonBignumber; // string TODO

	@Field(() => JsonBignumber, { nullable: true })
	gasPrice?: JsonBignumber;

	@Field({ nullable: true })
	data: string;

	@Field(() => JsonBignumber, { nullable: true })
	value: JsonBignumber;

	@Field({ nullable: true })
	chainId: number;

	@Field({ nullable: true })
	r?: string;

	@Field({ nullable: true })
	s?: string;

	@Field({ nullable: true })
	v?: number;

	// Typed-Transaction features
	@Field(() => Int, { nullable: true })
	type?: number | null;

	// EIP-2930; Type 1 & EIP-1559; Type 2
	@Field(() => [AccessListItem], { nullable: true })
	accessList?: AccessListItem[];

	// EIP-1559; Type 2
	@Field(() => JsonBignumber, { nullable: true })
	maxPriorityFeePerGas?: JsonBignumber;

	@Field(() => JsonBignumber, { nullable: true })
	maxFeePerGas?: JsonBignumber;
}
