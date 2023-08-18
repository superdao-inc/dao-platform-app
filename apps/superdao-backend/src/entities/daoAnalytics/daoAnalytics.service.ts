import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DaoAnalytics } from 'src/entities/daoAnalytics/daoAnalytics.model';
import { DaoMaskType } from 'src/entities/daoAnalytics/daoAnalytics.types';
import { NotFoundError } from 'src/exceptions';
import { Dao } from 'src/entities/dao/dao.model';

@Injectable()
export class DaoAnalyticsService {
	constructor(
		@InjectRepository(DaoAnalytics) private daoAnalyticsRepository: Repository<DaoAnalytics>,
		@InjectRepository(Dao) private daoRepository: Repository<Dao>
	) {}

	async createAnalytics(daoId: string, mask: DaoMaskType) {
		const dao = await this.daoRepository.findOneBy({ id: daoId });
		if (!dao) throw new NotFoundError('Dao not found');

		const daoAnalytics = new DaoAnalytics();
		daoAnalytics.mask = mask;
		daoAnalytics.daoId = daoId;
		return this.daoAnalyticsRepository.save(daoAnalytics);
	}

	async updateAnalytics(id: string, mask: DaoMaskType) {
		const daoAnalytics = await this.daoAnalyticsRepository.findOneBy({ id });
		if (!daoAnalytics) {
			throw new NotFoundError('DaoAnalytics not found');
		}

		daoAnalytics.mask = mask;
		return this.daoAnalyticsRepository.save(daoAnalytics);
	}

	async analyticsByDaoId(daoId: string) {
		return this.daoAnalyticsRepository.findOneBy({ daoId });
	}
}
