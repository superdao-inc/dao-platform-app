import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score } from 'src/entities/proposal/scores/scores.model';

@Injectable()
export class ScoresService {
	constructor(@InjectRepository(Score) private scoreRepository: Repository<Score>) {}

	getById(id: string) {
		return this.scoreRepository.findOne({ where: { id }, relations: ['proposal'] });
	}

	getByChoiceId(choiceId: string) {
		return this.scoreRepository.findOne({ where: { choiceId }, relations: ['proposal'] });
	}

	getByProposalId(proposal: string) {
		return this.scoreRepository.findBy({ proposal: { id: proposal } });
	}
}
