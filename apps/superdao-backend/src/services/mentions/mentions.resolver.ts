import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { AuthGuard } from 'src/auth.guard';
import { DaoSuggestionsBySlugResponse } from './dto/daoSuggestionsBySlugResponse.dto';
import { DaoSuggestionsBySlugInput } from './dto/daoSuggestionsBySlugInput.dto';
import { MentionsService } from './mentions.service';

@Resolver()
export class MentionsResolver {
	constructor(private readonly mentionsService: MentionsService) {}

	@Query(() => DaoSuggestionsBySlugResponse)
	@UseGuards(AuthGuard)
	async daoSuggestionsBySlug(
		@Args('input') { inputValue }: DaoSuggestionsBySlugInput
	): Promise<DaoSuggestionsBySlugResponse> {
		const suggestions = await this.mentionsService.getDaoSuggestionsBySlug(inputValue);

		return { suggestions };
	}
}
