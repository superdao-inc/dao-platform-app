import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DaoAnalyticsResolver } from 'src/entities/daoAnalytics/daoAnalytics.resolver';
import { DaoAnalyticsService } from 'src/entities/daoAnalytics/daoAnalytics.service';

// models
import { Dao } from 'src/entities/dao/dao.model';
import { DaoAnalytics } from 'src/entities/daoAnalytics/daoAnalytics.model';

@Module({
	imports: [TypeOrmModule.forFeature([Dao, DaoAnalytics])],
	providers: [DaoAnalyticsResolver, DaoAnalyticsService],
	exports: [DaoAnalyticsService]
})
export class DaoAnalyticsModule {}
