import { ArgsType, Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Min } from 'class-validator';
import { EcosystemType } from '@sd/superdao-shared';
import { Token } from 'src/entities/token';

@ArgsType()
export class GetBalanceArgs {
	@Field(() => String)
	address: string;

	@Field(() => Int, { nullable: true })
	@Min(1)
	chainId?: number;

	@Field(() => EcosystemType, { nullable: true, defaultValue: EcosystemType.EVM })
	ecosystem?: EcosystemType;
}

@ObjectType()
class Quote {
	@Field(() => String)
	currency: 'USD';

	@Field(() => String, {
		nullable: true,
		description: 'Price for 1 token in selected currency (1 MATIC = 0.9 USD, rate is "0.9")'
	})
	rate: string | null;
}

@ObjectType({ description: 'Token amount and value in terms of exchange rates' })
export class TokenBalance {
	@Field(() => Token)
	token: Token;

	@Field(() => Quote, { description: 'Exchange quote for one token nominated in selected currency' })
	quote: Quote;

	@Field(() => String, { description: 'Total value in quote currency (quote.rate * amount)' })
	value: string;

	@Field(() => String, { description: 'Number of available tokens' })
	amount: string;

	@Field(() => EcosystemType, { nullable: true, defaultValue: EcosystemType.EVM })
	ecosystem: EcosystemType;

	// TODO: BACKWORD COMPATIBILITY, REMOVE IN NEXT RELEASE ⬇⬇⬇

	@Field(() => String, { nullable: true })
	tokenAddress: string | null;

	@Field(() => String)
	symbol: string;

	@Field(() => String)
	name: string;

	@Field(() => Int)
	decimals: number;

	@Field(() => String, { nullable: true })
	logo: string | null;

	@Field(() => String)
	balance: string;

	@Field(() => Float)
	valueUsd: number;

	@Field(() => Float)
	priceUsd: number;
}
