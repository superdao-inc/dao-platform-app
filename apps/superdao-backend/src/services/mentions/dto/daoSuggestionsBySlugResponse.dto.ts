import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class DaoSuggestion {
	@Field(() => String)
	id: string;

	@Field(() => String)
	name: string;

	@Field(() => String)
	avatar?: string;
}

@ObjectType()
export class DaoSuggestionsBySlugResponse {
	@Field(() => [DaoSuggestion])
	suggestions: DaoSuggestion[];
}
