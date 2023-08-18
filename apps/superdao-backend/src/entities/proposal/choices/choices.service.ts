import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Choice } from './choices.model';

@Injectable()
export class ChoicesService {
	constructor(@InjectRepository(Choice) private choiceRepository: Repository<Choice>) {}

	getById(id: string) {
		return this.choiceRepository.findOne({ where: { id }, relations: ['proposal'] });
	}

	getByProposalId(proposal: string) {
		return this.choiceRepository.find({ where: { proposal: { id: proposal } } });
	}
}
