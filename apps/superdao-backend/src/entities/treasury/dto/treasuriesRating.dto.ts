import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

/**
 * Represent the Dao fields selection
 */
@ObjectType()
export class TreasuryRatingDao {
	@Field(() => ID)
	id: string;

	@Field(() => String)
	name: string;

	@Field(() => String)
	slug: string;

	@Field(() => String, { nullable: true })
	avatar: string | null;

	@Field(() => Float)
	valueUsd: number;
}

@ObjectType()
export class TreasuryRating {
	@Field(() => [TreasuryRatingDao])
	topDaos: TreasuryRatingDao[];

	@Field(() => Float)
	totalValueUsd: number;
}
