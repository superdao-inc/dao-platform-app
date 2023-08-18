import { InputType, Field } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { sanitizeStringTransform } from '@sd/superdao-shared';

@InputType()
export class DaoSuggestionsBySlugInput {
	@Field(() => String)
	@Transform(sanitizeStringTransform)
	inputValue: string;
}
