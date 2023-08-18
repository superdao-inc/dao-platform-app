import { ArgsType, Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ArgsType()
export class ExchangeRequestArgs {
	/**
	 * The quote currency (what to convert to).
	 * @example [1, 2781] - base currency will be converted to BTC (id=1) and USD (id=2781)
	 */
	@Field(() => [Int])
	quoteCurrenciesIds: number[];
}

@ArgsType()
export class ExchangeCurrenciesRequestArgs {
	/**
	 * base currency (what to convert).
	 */
	@Field(() => [Int])
	baseCurrenciesIds: number[];

	/**
	 * The quote currency (what to convert to).
	 * @example [1, 2781] - base currency will be converted to BTC (id=1) and USD (id=2781)
	 */
	@Field(() => [Int])
	quoteCurrenciesIds: number[];
}

@ObjectType()
export class ExchangePair {
	@Field(() => Int)
	baseCurrencyId: number;

	@Field(() => Int)
	quoteCurrencyId: number;

	/**
	 * baseCurrency / quoteCurrency
	 */
	@Field(() => Float)
	rate: number;
}
