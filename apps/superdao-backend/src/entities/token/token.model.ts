import { Field, ObjectType, InterfaceType } from '@nestjs/graphql';
import { EcosystemType } from '@sd/superdao-shared';

@InterfaceType({
	resolveType: (value) => {
		switch (value.type) {
			case 'ERC-20':
				return ERC20Token;
			case 'ERC-721':
				return ERC721Token;
			default:
				return NativeToken;
		}
	},
	description: "Token's static properties"
})
export abstract class Token {
	@Field(() => String)
	type: string;

	@Field(() => String)
	name: string;

	@Field(() => String, { nullable: true })
	address: string | null;

	@Field(() => String)
	symbol: string;

	@Field(() => EcosystemType, { nullable: true })
	ecosystem: EcosystemType;

	@Field(() => Number)
	chainId: number;

	@Field(() => String, { nullable: true })
	iconUrl: string | null;

	@Field(() => Number, { nullable: true })
	decimals: number;
}

@ObjectType({ implements: Token })
export class ERC20Token implements Token {
	@Field(() => String)
	type: 'ERC-20';

	@Field(() => String)
	name: string;

	@Field(() => String)
	iconUrl: string;

	@Field(() => String, { nullable: true })
	address: string | null;

	@Field(() => EcosystemType)
	ecosystem: EcosystemType;

	@Field(() => Number)
	chainId: number;

	@Field(() => String)
	symbol: string;

	@Field(() => Number)
	decimals: number;
}

@ObjectType({ implements: Token })
export class ERC721Token implements Token {
	@Field(() => String)
	type: 'ERC-721';

	@Field(() => String)
	name: string;

	@Field(() => String)
	address: string;

	@Field(() => EcosystemType)
	ecosystem: EcosystemType;

	@Field(() => Number)
	chainId: number;

	@Field(() => String)
	symbol: string;

	@Field(() => Number)
	tokenId: number;

	@Field(() => String, { nullable: true })
	iconUrl: string | null;

	@Field(() => Number)
	decimals: number;
}

@ObjectType({ implements: Token })
export class NativeToken implements Token {
	@Field(() => String)
	type: 'NATIVE';

	@Field(() => String)
	name: string;

	@Field(() => String, { nullable: true })
	address: string | null;

	@Field(() => EcosystemType)
	ecosystem: EcosystemType;

	@Field(() => Number)
	chainId: number;

	@Field(() => String)
	iconUrl: string;

	@Field(() => String)
	symbol: string;

	@Field(() => Number)
	decimals: number;
}
