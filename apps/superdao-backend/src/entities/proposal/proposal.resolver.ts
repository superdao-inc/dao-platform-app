import { Args, Context, Mutation, Query, ResolveField, Resolver, Root } from '@nestjs/graphql';

import express from 'express';
import { UseGuards } from '@nestjs/common';
import { AuthenticationError } from 'apollo-server-core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import { DaoProposalsRequest, ProposalStatus, ProposalVotingType, VoteRequest } from './proposal.types';
import { Score } from './scores/scores.model';
import { Vote } from './votes/vote.model';

import { ProposalService } from './proposal.service';
import { ProposalSettingsDto } from 'src/entities/proposal/dto/proposalSettings.dto';
import { Proposal } from 'src/entities/proposal/proposal.model';
import { AllProposalsResponse } from 'src/entities/proposal/dto/paginatedProposal.dto';
import { CreateManyChoicesDto } from 'src/entities/proposal/choices/dto/createChoice.dto';
import { Choice } from 'src/entities/proposal/choices/choices.model';
import { getProposalStatus, validateProposalStartEndTime } from 'src/entities/proposal/proposal.utils';
import { ForbiddenError, NotFoundError, ValidationError } from 'src/exceptions';
import { validateFile } from 'src/utils/upload';
import { DelayedVotingEventMessage } from 'src/services/voting/types';
import { AuthGuard } from 'src/auth.guard';
import { VoteService } from 'src/entities/proposal/votes/vote.service';
import { ChoicesService } from 'src/entities/proposal/choices/choices.service';
import { ScoresService } from 'src/entities/proposal/scores/scores.service';
import { DaoService } from 'src/entities/dao/dao.service';
import { UserService } from 'src/entities/user/user.service';
import { DelayedMessageBrokerService } from 'src/services/messageBroker/delayedMessage/delayedMessage.service';

@Resolver(() => Proposal)
export class ProposalResolver {
	constructor(
		@InjectRepository(Proposal) private proposalRepository: Repository<Proposal>,
		private readonly proposalService: ProposalService,
		private readonly voteService: VoteService,
		private readonly choicesService: ChoicesService,
		private readonly scoresService: ScoresService,
		private readonly userService: UserService,
		private readonly daoService: DaoService,
		private readonly daoMembershipService: DaoMembershipService,
		private readonly delayedMessageBrokerService: DelayedMessageBrokerService
	) {}

	@UseGuards(AuthGuard)
	@ResolveField(() => [Choice])
	choices(@Root() proposal: Proposal) {
		return this.choicesService.getByProposalId(proposal.id);
	}

	@UseGuards(AuthGuard)
	@ResolveField(() => [Score])
	scores(@Root() proposal: Proposal) {
		return this.scoresService.getByProposalId(proposal.id);
	}

	@UseGuards(AuthGuard)
	@Query(() => AllProposalsResponse)
	proposals(@Args() getAllProposals: DaoProposalsRequest): Promise<AllProposalsResponse> {
		return this.proposalService.getAll(getAllProposals);
	}

	@UseGuards(AuthGuard)
	@Query(() => Proposal, { nullable: true })
	async getProposal(@Args('proposalId') proposalId: string) {
		return await this.proposalService.getByIdWithRelations(proposalId, ['dao', 'votes']);
	}

	@UseGuards(AuthGuard)
	@Query(() => [Choice])
	getChoices(@Args('proposalId') proposalId: string): Promise<Choice[] | undefined> {
		return this.choicesService.getByProposalId(proposalId);
	}

	@UseGuards(AuthGuard)
	@Query(() => [Score])
	getScores(@Args('proposalId') proposalId: string): Promise<Score[] | undefined> {
		return this.scoresService.getByProposalId(proposalId);
	}

	@UseGuards(AuthGuard)
	@Query(() => [Vote])
	getVotes(@Args('proposalId') proposalId: string): Promise<Vote[] | undefined> {
		return this.voteService.getByProposalId(proposalId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Proposal)
	async createProposal(
		@Context('req') ctx: express.Request,
		@Args('proposal') proposal: ProposalSettingsDto,
		@Args('createChoiceData') createChoiceData: CreateManyChoicesDto
	): Promise<Proposal> {
		const userId = ctx.session?.userId;

		if (!userId) {
			throw new AuthenticationError('Unauthorized');
		}

		await this.daoMembershipService.checkAccess(userId, proposal.daoId, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);

		const newProposal = new Proposal();

		validateProposalStartEndTime(proposal.startAt, proposal.endAt);

		const dao = await this.daoService.getById(proposal.daoId);

		if (!dao) {
			throw new NotFoundError();
		}

		const isAttachmentValid = proposal.attachment ? await validateFile(proposal.attachment) : true;
		if (!isAttachmentValid) {
			throw new ValidationError('File id is not valid');
		}

		Object.assign(newProposal, proposal, {
			startAt: proposal.startAt ?? new Date()
		});
		newProposal.dao = dao;
		await newProposal.save();

		const choiceChunks = await Choice.save(
			createChoiceData.choices.map((choice) => {
				const newChoice = new Choice();
				newChoice.name = choice.name;
				newChoice.proposal = newProposal;

				return newChoice;
			})
		);
		await Score.save(
			choiceChunks.map((choice) => {
				const score = new Score();
				score.choiceId = choice.id;
				score.proposal = newProposal;
				return score;
			})
		);

		const isProposalActive = !proposal.startAt;

		let msgDelay = newProposal.startAt.getTime() - Date.now();
		if (isProposalActive) {
			msgDelay = newProposal.endAt.getTime() - Date.now();
		}

		const msgData: DelayedVotingEventMessage['data'] = {
			proposalId: newProposal.id,
			edition: newProposal.edition,
			startAt: newProposal.startAt,
			endAt: newProposal.endAt,
			from: 'create',
			afterIter: false
		};

		await this.delayedMessageBrokerService.trackVotingDelayedMessage(msgData, msgDelay);

		try {
			if (isProposalActive) {
				const users = await this.daoMembershipService.getAllMembers(dao.id);

				this.proposalService.sendProposalStartedEmails(
					users.filter((user) => user.email),
					dao,
					newProposal
				);
			}
		} catch (e) {}

		return newProposal;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Proposal)
	async editProposal(
		@Context('req') ctx: express.Request,
		@Args('proposalId') proposalId: string,
		@Args('proposal') proposal: ProposalSettingsDto,
		@Args('createChoiceData') createChoiceData: CreateManyChoicesDto
	): Promise<Proposal> {
		const userId = ctx.session?.userId;

		if (!userId) {
			throw new AuthenticationError('Unauthorized');
		}

		await this.daoMembershipService.checkAccess(userId, proposal.daoId, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);

		const currentProposal = await this.proposalService.getById(proposalId);

		if (!currentProposal) {
			throw new NotFoundError();
		}

		if (getProposalStatus(currentProposal) !== ProposalStatus.pending) {
			throw new ValidationError('Proposal has already started');
		}

		validateProposalStartEndTime(proposal.startAt, proposal.endAt);

		const dao = await this.daoService.getById(proposal.daoId);

		if (!dao) {
			throw new NotFoundError();
		}

		const isAttachmentValid = proposal.attachment ? await validateFile(proposal.attachment) : true;
		if (!isAttachmentValid) {
			throw new ValidationError('File id is not valid');
		}

		const needNewDelayedMessage =
			new Date(proposal.startAt).getTime() !== new Date(currentProposal.startAt).getTime() ||
			new Date(proposal.endAt).getTime() !== new Date(currentProposal.endAt).getTime();

		Object.assign(currentProposal, proposal);

		const oldChoiceChunks = await this.choicesService.getByProposalId(proposalId);
		oldChoiceChunks.map(async (choice) => {
			const oldChoice = await this.scoresService.getByChoiceId(choice.id);

			await oldChoice?.remove();
			await choice.remove();

			return oldChoice;
		});
		await Promise.all(oldChoiceChunks);

		const choiceChunks = await Choice.save(
			createChoiceData.choices.map((choice) => {
				const newChoice = new Choice();
				newChoice.name = choice.name;
				newChoice.proposal = currentProposal;

				return newChoice;
			})
		);
		await Score.save(
			choiceChunks.map((choice) => {
				const score = new Score();
				score.choiceId = choice.id;
				score.proposal = currentProposal;
				return score;
			})
		);

		currentProposal.createdBySuperdao = false;
		currentProposal.edition = (currentProposal.edition || 0) + 1;

		await currentProposal.save();

		// here cannot be any delay except of delay to start proposal
		let msgDelay = currentProposal.startAt.getTime() - Date.now();

		const msgData: DelayedVotingEventMessage['data'] = {
			proposalId: currentProposal.id,
			edition: currentProposal.edition,
			startAt: currentProposal.startAt,
			endAt: currentProposal.endAt,
			from: 'edit',
			afterIter: false
		};

		if (needNewDelayedMessage) await this.delayedMessageBrokerService.trackVotingDelayedMessage(msgData, msgDelay);

		return currentProposal;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async deleteProposal(@Context('req') ctx: express.Request, @Args('proposalId') proposalId: string): Promise<boolean> {
		const userId = ctx.session?.userId;

		if (!userId) {
			throw new AuthenticationError('Unauthorized');
		}

		const proposal = await this.proposalService.getByIdWithRelations(proposalId, ['dao']);

		if (!proposal || !proposal.dao) {
			throw new NotFoundError();
		}

		await this.daoMembershipService.checkAccess(userId, proposal.dao.id, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);

		const deleteResult = await this.proposalRepository.delete(proposalId);
		return deleteResult.affected === 1;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async vote(@Context('req') ctx: express.Request, @Args() VoteRequest: VoteRequest): Promise<boolean> {
		const { proposalId, choiceIds } = VoteRequest;

		const userId = ctx.session?.userId;
		if (!userId) {
			throw new AuthenticationError('Unauthorized');
		}

		const user = await this.userService.getUserById(userId);
		if (!user || ctx.session?.user) throw new AuthenticationError('Unauthorized');

		const proposal = await this.proposalService.getByIdWithRelations(proposalId, ['dao']);

		if (!proposal) {
			throw new NotFoundError();
		}

		await this.daoMembershipService.checkAccess(userId, proposal.dao.id, [
			DaoMemberRole.Creator,
			DaoMemberRole.Admin,
			DaoMemberRole.Member
		]);

		if (getProposalStatus(proposal) !== ProposalStatus.active) {
			throw new ForbiddenError('Proposal already ended or not started');
		}

		if (proposal.votingType === ProposalVotingType.singleChoice && choiceIds.length > 1) {
			throw new ForbiddenError('Proposal is single-choice');
		}

		const choiceChunks = choiceIds.map(async (choiceId) => {
			const newVote = new Vote();

			const choice = await this.choicesService.getById(choiceId);

			if (!choice || choice.proposal.id !== proposalId) {
				throw new ForbiddenError('Choice must be for provided proposal');
			}

			const score = await this.scoresService.getByChoiceId(choiceId);

			if (!score || score.proposal.id !== proposalId) {
				throw new ForbiddenError('Score must be for provided proposal');
			}

			const votingPower = await this.proposalService.calculateVotingPower(userId, proposal);
			score.value += votingPower;

			await score.save();

			newVote.power = votingPower;
			newVote.choiceId = choiceId;
			newVote.user = user;
			newVote.proposal = proposal;

			await newVote.save();
		});
		await Promise.all(choiceChunks);

		return true;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async addDemoProposals(@Context('req') ctx: express.Request): Promise<boolean> {
		const userId = ctx.session?.userId;
		if (!userId) throw new AuthenticationError('Unauthorized');

		const user = await this.userService.getUserById(userId);
		if (!user || ctx.session?.user || !user.isSupervisor) throw new AuthenticationError('Unauthorized');

		await this.proposalService.addDemoProposals();

		return true;
	}
}
