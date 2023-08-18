import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from 'src/entities/proposal/votes/vote.model';

@Injectable()
export class VoteService {
	constructor(@InjectRepository(Vote) private voteRepository: Repository<Vote>) {}

	getByProposalId(proposal: string) {
		return this.voteRepository.find({ where: { proposal: { id: proposal } }, relations: ['proposal', 'user'] });
	}
}
