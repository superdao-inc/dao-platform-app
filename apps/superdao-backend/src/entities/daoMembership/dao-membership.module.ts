import { forwardRef, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import { DaoMembershipResolver } from 'src/entities/daoMembership/daoMembership.resolver';
import { DaoMembership } from 'src/entities/daoMembership/daoMembership.model';
import { Dao } from 'src/entities/dao/dao.model';
import { User } from 'src/entities/user/user.model';
import { UserModule } from 'src/entities/user/user.module';
import { EventsModule } from 'src/services/socket/events.module';
import { DaoModule } from '../dao/dao.module';
import { ReferralMember } from '../referral/models/referralMember.model';
import { TransactionBrokerModule } from 'src/services/messageBroker/transaction/transactionBroker.module';
import { TransactionsLoggingModule } from '../logging/logging.module';

@Global()
@Module({
	imports: [
		TypeOrmModule.forFeature([User, Dao, DaoMembership, ReferralMember]),
		EventsModule,
		TransactionBrokerModule,
		forwardRef(() => UserModule),
		forwardRef(() => DaoModule),
		TransactionsLoggingModule
	],
	providers: [DaoMembershipService, DaoMembershipResolver],
	exports: [DaoMembershipService]
})
export class DaoMembershipModule {}
