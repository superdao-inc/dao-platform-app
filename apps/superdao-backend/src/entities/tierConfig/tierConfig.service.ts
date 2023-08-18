import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TierConfig } from './tierConfig.model';
import { NftTierConfig } from './tierConfig.types';

@Injectable()
export class TierConfigService {
	private readonly logger = new Logger(TierConfigService.name);

	constructor(@InjectRepository(TierConfig) private readonly tierConfigRepository: Repository<TierConfig>) {}

	async getTierConfigListByDao(daoAddress: string): Promise<TierConfig[]> {
		try {
			const qb = await this._getPublicTierQueryBuilder();

			const configList = qb.where('tier_config.daoAddress = :daoAddress', { daoAddress }).getMany();

			return configList;
		} catch (error: any) {
			this.logger.error({
				message: error?.message ?? `Error ocurred: getTierConfigListByDao() for DAO: ${daoAddress}`,
				stack: error?.stack
			});

			return [];
		}
	}

	async getTierConfigListByCollection(collectionAddress: string): Promise<TierConfig[]> {
		try {
			const qb = await this._getPublicTierQueryBuilder();

			const configList = qb
				.where('tier_config.collectionAddress = :collectionAddress', { collectionAddress })
				.getMany();

			return configList;
		} catch (error: any) {
			this.logger.error({
				message:
					error?.message ?? `Error ocurred: getTierConfigListByCollection() for Collection: ${collectionAddress}`,
				stack: error?.stack
			});

			return [];
		}
	}

	async updateTierConfigList(listToUpdate: Partial<NftTierConfig>[]) {
		try {
			this.tierConfigRepository.upsert(listToUpdate, {
				conflictPaths: ['id'],
				skipUpdateIfNoValuesChanged: true
			});
		} catch (error: any) {
			this.logger.error({
				message: error?.message ?? 'Error ocurred: updateTierConfigList()',
				stack: error?.stack
			});

			return [];
		}
	}

	async _getPublicTierQueryBuilder() {
		return this.tierConfigRepository
			.createQueryBuilder('tier_config')
			.orderBy('tier_config.position', 'ASC', 'NULLS LAST');
	}
}
