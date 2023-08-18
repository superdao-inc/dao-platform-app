import { forwardRef, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserResolver } from 'src/entities/user/user.resolver';
import { User } from 'src/entities/user/user.model';
import { DaoMembership } from 'src/entities/daoMembership/daoMembership.model';
import { CollectionsModule } from 'src/entities/collections/collections.module';
import { DaoModule } from 'src/entities/dao/dao.module';
import { UserNotification } from 'src/entities/userNotification/userNotification.model';
import { LinksModule } from '../links/links.module';
import { Links } from '../links/links.model';
import { EmailModule } from 'src/services/email/email.module';
import { CompositeBlockchainModule } from 'src/services/blockchain/blockchain.module';
import { GraphModule } from 'src/services/the-graph/graph-polygon/graph.module';

@Global()
@Module({
	imports: [
		TypeOrmModule.forFeature([User, Links, UserNotification, DaoMembership]),
		forwardRef(() => DaoModule),
		CollectionsModule,
		LinksModule,
		EmailModule,
		GraphModule,
		CompositeBlockchainModule
	],
	providers: [UserService, UserResolver],
	exports: [TypeOrmModule, UserService]
})
export class UserModule {}
