import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalService } from './proposal.service';
import { ProposalResolver } from './proposal.resolver';
import { Proposal } from './proposal.model';
import { Score } from './scores/scores.model';
import { VoteService } from './votes/vote.service';
import { ChoicesService } from './choices/choices.service';
import { ScoresService } from './scores/scores.service';
import { Choice } from './choices/choices.model';
import { Vote } from 'src/entities/proposal/votes/vote.model';
import { Dao } from 'src/entities/dao/dao.model';
import { DaoModule } from 'src/entities/dao/dao.module';
import { DaoMembershipModule } from 'src/entities/daoMembership/dao-membership.module';
import { EmailModule } from 'src/services/email/email.module';
import { DelayedMessageBrokerModule } from 'src/services/messageBroker/delayedMessage/delayedMessage.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Dao, Proposal, Score, Choice, Vote]),
		forwardRef(() => DaoModule),
		forwardRef(() => DaoMembershipModule),
		EmailModule,
		DelayedMessageBrokerModule
	],
	providers: [ProposalService, VoteService, ChoicesService, ScoresService, ProposalResolver],
	exports: [ProposalService]
})
export class ProposalModule {}
