import { Field, InputType } from '@nestjs/graphql';
import { Matches, MaxLength, MinLength } from 'class-validator';
import { Dao } from '../dao.model';
import { Document } from '../dao.types';
import { SLUG_MIN_LENGTH, SLUG_REGEX } from '@sd/superdao-shared';

@InputType()
export class CreateDaoInput implements Partial<Dao> {
	@Field()
	@MinLength(SLUG_MIN_LENGTH)
	@MaxLength(100)
	name: string;

	@Field()
	@MinLength(1)
	description: string;

	@Field()
	@MinLength(SLUG_MIN_LENGTH)
	@MaxLength(100)
	@Matches(SLUG_REGEX)
	slug: string;

	@Field(() => String, { nullable: true })
	avatar: string | null;

	@Field(() => String, { nullable: true })
	cover: string | null;

	@Field(() => String, { nullable: true, defaultValue: '' })
	site: string | null;

	@Field(() => String, { nullable: true })
	contractAddress?: string;

	@Field(() => String, { nullable: true, defaultValue: '' })
	ensDomain?: string;

	@Field(() => String, { nullable: true, defaultValue: '' })
	twitter: string | null;

	@Field(() => String, { nullable: true, defaultValue: '' })
	instagram: string | null;

	@Field(() => String, { nullable: true, defaultValue: '' })
	telegram: string | null;

	@Field(() => String, { nullable: true, defaultValue: '' })
	discord: string | null;

	@Field(() => String, { nullable: true, defaultValue: '' })
	whitelistUrl: string | null;

	@Field(() => [Document])
	documents: Document[];

	@Field(() => String, { nullable: true, defaultValue: '' })
	supportChatUrl: string | null;
}
