import { Field, InputType } from '@nestjs/graphql';

import { MaxLength, MinLength } from 'class-validator';
import { CHOICE_CONTENT_MAX_LENGTH } from '@sd/superdao-shared';

import { Choice } from 'src/entities/proposal/choices/choices.model';

@InputType()
class CreateChoiceDto implements Partial<Choice> {
	@Field(() => String)
	@MinLength(1)
	@MaxLength(CHOICE_CONTENT_MAX_LENGTH)
	name: string;
}

@InputType()
export class CreateManyChoicesDto {
	@Field(() => [CreateChoiceDto])
	choices: CreateChoiceDto[];
}
