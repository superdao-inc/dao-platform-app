import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Dao } from 'src/entities/dao/dao.model';
import { DaoSuggestion } from './dto/daoSuggestionsBySlugResponse.dto';

@Injectable()
export class MentionsService {
	constructor(@InjectRepository(Dao) private readonly daoRepository: Repository<Dao>) {}

	async getDaoSuggestionsBySlug(input: string): Promise<DaoSuggestion[]> {
		const daos = await this.daoRepository.findBy({ slug: ILike(`${input}%`) });

		return daos.map(({ id, slug, avatar }) => ({ id, name: slug, avatar: avatar ?? '' }));
	}
}
