import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookController } from 'src/services/webhook/webhook.controller';
import { WebhookService } from 'src/services/webhook/webhook.service';
import { WhitelistModule } from 'src/entities/whitelist/whitelist.module';
import { NftModule } from 'src/entities/nft/nft.module';
import { DaoModule } from 'src/entities/dao/dao.module';
import { DaoMembershipModule } from 'src/entities/daoMembership/dao-membership.module';
import { TransactionBrokerModule } from 'src/services/messageBroker/transaction/transactionBroker.module';
import { EmailModule } from 'src/services/email/email.module';
import { User } from 'src/entities/user/user.model';

@Module({
	imports: [
		WhitelistModule,
		NftModule,
		DaoModule,
		DaoMembershipModule,
		TransactionBrokerModule,
		EmailModule,
		TypeOrmModule.forFeature([User])
	],
	providers: [WebhookService],
	controllers: [WebhookController],
	exports: [WebhookService]
})
export class WebhookModule {}
