import { Module } from '@nestjs/common';
import { PreviewService } from 'src/services/preview/preview.service';
import { CollectionsModule } from 'src/entities/collections/collections.module';
import { DaoModule } from 'src/entities/dao/dao.module';
import { PreviewController } from './preview.controller';
import { PreviewApi } from './preview.api';
import { ExternalApiConnector } from '../externalConnector/externalApiConnector.helper';
import { CompositeBlockchainModule } from '../blockchain/blockchain.module';

@Module({
	imports: [CollectionsModule, DaoModule, CompositeBlockchainModule],
	providers: [
		PreviewService,
		PreviewApi,
		{
			provide: 'PreviewConnector',
			useValue: new ExternalApiConnector({ connectorName: 'PreviewConnector' })
		}
	],
	exports: [PreviewService],
	controllers: [PreviewController]
})
export class PreviewModule {}
