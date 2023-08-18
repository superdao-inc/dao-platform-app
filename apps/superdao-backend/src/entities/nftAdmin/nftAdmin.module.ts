import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { wallet } from 'src/blockchain/common';
import { ContractModule } from 'src/entities/contract/contract.module';
import { CacheModule } from 'src/services/cache/cache.module';
import { AdminControllerHelperService } from 'src/entities/contract/adminControllerHelper.service';
import { CollectionsModule } from 'src/entities/collections/collections.module';
import { IpfsMetadataModule } from 'src/entities/ipfsMetadata/ipfsMetadata.module';
import { DaoMembershipModule } from 'src/entities/daoMembership/dao-membership.module';
import { UserModule } from 'src/entities/user/user.module';
import { Dao } from 'src/entities/dao/dao.model';
import { Kernel__factory } from 'src/typechain';
import { TransactionBrokerModule } from 'src/services/messageBroker/transaction/transactionBroker.module';
import { NftAdminService } from './nftAdmin.service';
import { NftAdminResolver } from './nftAdmin.resolver';
import { TierConfigModule } from '../tierConfig/tierConfig.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Dao]),
		CacheModule,
		ContractModule,
		CollectionsModule,
		TierConfigModule,
		IpfsMetadataModule,
		DaoMembershipModule,
		UserModule,
		TransactionBrokerModule
	],
	providers: [
		NftAdminResolver,
		NftAdminService,
		{
			provide: Kernel__factory,
			useValue: new Kernel__factory(wallet)
		},
		AdminControllerHelperService
	],
	exports: [NftAdminService]
})
export class NftAdminModule {}
