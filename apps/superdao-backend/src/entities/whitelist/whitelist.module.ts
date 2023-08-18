import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhitelistService } from 'src/entities/whitelist/whitelist.service';
import { WhitelistResolver } from 'src/entities/whitelist/whitelist.resolver';
import { Whitelist } from 'src/entities/whitelist/whitelist.model';
import { ContractModule } from 'src/entities/contract/contract.module';
import { DaoModule } from 'src/entities/dao/dao.module';
import { Dao } from 'src/entities/dao/dao.model';
import { CollectionsModule } from 'src/entities/collections/collections.module';
import { EmailModule } from 'src/services/email/email.module';
import { TransactionBrokerModule } from 'src/services/messageBroker/transaction/transactionBroker.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Whitelist, Dao]),
		DaoModule,
		ContractModule,
		CollectionsModule,
		EmailModule,
		TransactionBrokerModule
	],
	providers: [WhitelistService, WhitelistResolver],
	exports: [WhitelistService]
})
export class WhitelistModule {}
