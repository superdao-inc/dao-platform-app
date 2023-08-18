import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Dao } from '../dao/dao.model';
import { Proposal } from './proposal.model';
import { DaoProposalsRequest, ProposalStatus, ProposalVotingPowerType, ProposalVotingType } from './proposal.types';
import { Choice } from './choices/choices.model';
import { Score } from './scores/scores.model';
import { DelayedVotingEventMessage } from 'src/services/voting/types';
import { getProposalStatus } from './proposal.utils';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import { ValidationError } from 'src/exceptions';
import { User } from 'src/entities/user/user.model';
import { EmailService } from 'src/services/email/email.service';
import { Cover } from '@sd/superdao-shared';
import { featureToggles } from 'src/services/featureToggles';
import { getMailingListWithName } from 'src/services/email/utils/getMailingList';
import { DelayedMessageBrokerService } from 'src/services/messageBroker/delayedMessage/delayedMessage.service';
import { normalizeSearchQuery } from 'src/utils/normalizeSearchQuery';

@Injectable()
export class ProposalService {
	private readonly logger = new Logger(ProposalService.name);

	constructor(
		@InjectRepository(Dao) private daoRepository: Repository<Dao>,
		@InjectRepository(Proposal) private proposalRepository: Repository<Proposal>,
		@Inject(forwardRef(() => DaoMembershipService)) private daoMembershipService: DaoMembershipService,
		private readonly emailService: EmailService,
		private readonly delayedMessageBrokerService: DelayedMessageBrokerService
	) {}

	isSendingVotingEmailsEnabled = () => featureToggles.isEnabled('voting_send_emails');

	async calculateVotingPower(userId: string, proposal: Proposal) {
		if (proposal.votingPowerType === ProposalVotingPowerType.single) {
			return 1;
		}
		// TODO: calculate voting power using userId
		this.logger.log(`Calculated power for user ${userId} = 1 anyway`);
		return 1;
	}

	isOutdatedEdition(proposalEdition: number, newEdition: number) {
		return proposalEdition === newEdition;
	}

	async sendProposalStartedEmails(users: DeepPartial<User>[], dao: DeepPartial<Dao>, proposal: Partial<Proposal>) {
		// if (!this.isSendingVotingEmailsEnabled()) {
		// 	return;
		// }

		const { id, name, slug, cover, avatar } = dao;
		const { title, description, startAt } = proposal;

		const seed = id ? id.split('').reverse().join() : 'peachpuff';

		const emailData = {
			hasHeaderImage: !!cover,
			headerBackground: cover
				? `https://ucarecdn.com/${cover}/-/preview/-/quality/smart/`
				: Cover.generateCoverGradient(id ?? ''),
			hasAvatar: !!avatar,
			daoAvatar: avatar
				? `https://ucarecdn.com/${avatar}/-/preview/-/quality/smart/`
				: Cover.generateCoverGradient(seed),
			daoName: name ?? '',
			proposalHeading: title ?? '',
			proposalDescription: description ?? '',
			proposalLink: `https://app.superdao.co/${slug}/voting/${proposal.id ?? ''}`,
			proposalStartDate: startAt
		};

		const { emails, variables } = getMailingListWithName(users);

		this.emailService.sendProposalStartedMessage(emails, variables, emailData);
	}

	async sendProposalEndedEmails(users: DeepPartial<User>[], dao: DeepPartial<Dao>, proposal: DeepPartial<Proposal>) {
		// if (!this.isSendingVotingEmailsEnabled()) {
		// 	return;
		// }

		const { name, slug } = dao;
		const { title, description, choices, scores, votingType } = proposal;
		const sortedScores = scores?.sort((a, b) => +(b.value ?? 0) - +(a.value ?? 0));

		const result = (sortedScores && sortedScores[0]) || {};
		const resultText = choices?.find((choice) => choice.id === result.choiceId)?.name ?? '';

		const emailData = {
			daoName: name ?? '',
			proposalHeading: title ?? '',
			proposalDescription: description ?? '',
			proposalLink: `https://app.superdao.co/${slug}/voting/${proposal.id ?? ''}`,
			proposalVotingType: votingType,
			proposalResult: resultText
		};

		const { emails, variables } = getMailingListWithName(users);

		this.emailService.sendProposalEndedMessage(emails, variables, emailData);
	}

	async sendProposalEmails(proposalId: string, edition: number) {
		const proposal = await this.getByIdWithRelations(proposalId, ['dao', 'choices', 'scores']);
		if (!proposal) {
			this.logger.error('proposal emails can not be sent, proposal not found', { proposalId });
			return false;
		}

		const isEditionValid = this.isOutdatedEdition(proposal.edition, edition);
		if (!isEditionValid) {
			this.logger.error('proposal emails can not be sent, proposal edition is not valid', {
				edition,
				proposalEdition: proposal.edition
			});
			return false;
		}

		const dao = await this.daoRepository.findOneBy({ id: proposal.dao.id });
		if (!dao) {
			this.logger.error('proposal emails can not be sent, dao not found', { daoId: proposal.dao.id });
			return false;
		}

		const users = await this.daoMembershipService.getAllMembers(dao.id);

		this.logger.log(
			`Proposal emails are ready to be sent. Params: proposalId=${proposalId} edition=${edition} proposalStatus=${getProposalStatus(
				proposal
			)}`
		);

		if (getProposalStatus(proposal) === ProposalStatus.active) {
			try {
				this.logger.log(`Proposal started emails are ready to be sent. Params: proposalId=${proposalId}`);

				await this.sendProposalStartedEmails(
					users.filter((user) => user.email),
					dao,
					proposal
				);
			} catch (e) {
				this.logger.error('proposal started emails can not be sent', { e });
			}
		} else if (getProposalStatus(proposal) === ProposalStatus.closed) {
			try {
				this.logger.log(`Proposal ended emails are ready to be sent. Params: proposalId=${proposalId}`);

				await this.sendProposalEndedEmails(
					users.filter((user) => user.email),
					dao,
					proposal
				);
			} catch (e) {
				this.logger.error('proposal ended emails can not be sent', { e });
			}
		}

		return true;
	}

	createDemoProposal = async (
		proposal: Partial<Proposal>,
		choices: { name: string }[],
		dao: Dao,
		proposalStatus: ProposalStatus
	): Promise<boolean> => {
		let newProposal = new Proposal();

		Object.assign(newProposal, proposal);
		newProposal.dao = dao;
		newProposal.createdBySuperdao = true;
		await newProposal.save();

		let choiceChunks = choices.map(async (choice) => {
			const newChoice = new Choice();
			newChoice.name = choice.name;
			newChoice.proposal = newProposal;

			const choiceResult = await newChoice.save();

			const choiceScore = new Score();
			choiceScore.choiceId = choiceResult.id;
			choiceScore.proposal = newProposal;

			await choiceScore.save();
			return newChoice;
		});
		await Promise.all(choiceChunks);

		let msgDelay = newProposal.startAt.getTime() - Date.now();
		if (proposalStatus === ProposalStatus.active) {
			msgDelay = newProposal.endAt.getTime() - Date.now();
		}

		let msgData: DelayedVotingEventMessage['data'] = {
			proposalId: newProposal.id,
			edition: newProposal.edition,
			startAt: newProposal.startAt,
			endAt: newProposal.endAt,
			from: 'autoCreation',
			afterIter: false
		};

		await this.delayedMessageBrokerService.trackVotingDelayedMessage(msgData, msgDelay);

		return true;
	};

	createDemoProposals = async (dao: Dao): Promise<boolean> => {
		/**
		 * First proposal
		 */
		let proposal: Partial<Proposal> = {
			title: 'Does pineapple belong on pizza?',
			description: '',
			startAt: new Date(),
			endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // +30 days
			edition: 0,
			votingType: ProposalVotingType.singleChoice,
			votingPowerType: ProposalVotingPowerType.single
		};
		let choices = [{ name: 'Yes, please' }, { name: 'No way' }];

		await this.createDemoProposal(proposal, choices, dao, ProposalStatus.active);

		/**
		 * Second proposal
		 */
		proposal = {
			title: 'When Ethereum Proof-of-Stake?',
			description: '',
			startAt: new Date(),
			endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // +30 days
			edition: 0,
			votingType: ProposalVotingType.singleChoice,
			votingPowerType: ProposalVotingPowerType.single
		};
		choices = [{ name: '2022' }, { name: 'hahahhah' }, { name: 'never' }];

		await this.createDemoProposal(proposal, choices, dao, ProposalStatus.active);

		/**
		 * Third proposal
		 */
		proposal = {
			title: 'Meme of the week?',
			description: '',
			startAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // +30 days
			endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // +60 days
			edition: 0,
			votingType: ProposalVotingType.singleChoice,
			votingPowerType: ProposalVotingPowerType.single,
			attachment: '78460c5d-41f7-4193-9ece-dfa96e554904'
		};
		choices = [{ name: '1' }, { name: '2' }, { name: '3' }];

		await this.createDemoProposal(proposal, choices, dao, ProposalStatus.pending);

		/**
		 * Fourth proposal
		 */
		proposal = {
			title: 'Which NFT artwork from our collection do you like most?',
			description: '',
			startAt: new Date(),
			endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // +30 days
			edition: 0,
			votingType: ProposalVotingType.singleChoice,
			votingPowerType: ProposalVotingPowerType.single,
			attachment: '0800ae08-b6f4-4858-bf42-2fe4dbd7ae89'
		};
		choices = [{ name: '1' }, { name: '2' }, { name: '3' }];

		await this.createDemoProposal(proposal, choices, dao, ProposalStatus.active);

		return true;
	};

	async addDemoProposals() {
		const filteredDaos = await this.getAllDaosWithoutDemoProposals();

		await Promise.all(
			filteredDaos.map(async (dao) => {
				await this.createDemoProposals(dao);

				dao.hasDemoProposals = true;
				dao.isVotingEnabled = true;
				await dao.save();
			})
		);
	}

	async getAllDaosWithoutDemoProposals() {
		const daos = await this.daoRepository.createQueryBuilder('daos').getMany();
		const daosWithoutDemoProposals = daos.filter((dao) => !dao.hasDemoProposals);

		return daosWithoutDemoProposals;
	}

	async handleVotingEvent(msgContent: DelayedVotingEventMessage, ackCallback: () => void) {
		const {
			data: { proposalId, edition, startAt, endAt, from, afterIter }
		} = msgContent;

		// ack all messages no matter what happen with event
		ackCallback();
		this.logger.log(
			`Proposal event is handling. Params: proposalId=${proposalId} edition=${edition} startAt=${startAt} endAt=${endAt} from=${from} afterIter=${afterIter}`
		);

		const areEmailsSent = await this.sendProposalEmails(proposalId, edition);

		if (!areEmailsSent) {
			throw new ValidationError(
				`Proposal event can not be handled. Params: proposalId=${proposalId} edition=${edition} startAt=${startAt} endAt=${endAt} from=${from} afterIter=${afterIter}`
			);
		}

		this.logger.log(
			`Proposal emails were sent. Params: proposalId=${proposalId} edition=${edition} startAt=${startAt} endAt=${endAt} from=${from} afterIter=${afterIter}`
		);

		if (Date.now() < new Date(endAt).getTime()) {
			// here cannot be any delay except of delay to end proposal
			let msgDelay = new Date(endAt).getTime() - Date.now();

			const nextMsgData: DelayedVotingEventMessage['data'] = {
				proposalId,
				edition,
				startAt,
				endAt,
				from,
				afterIter: true
			};

			this.logger.log(
				`Proposal event is re-sending. Params: msgDelay=${msgDelay} actualDelay=${
					msgDelay + 1000
				} proposalId=${proposalId} edition=${edition} startAt=${startAt} endAt=${endAt} from=${from} afterIter=${afterIter}`
			);

			await this.delayedMessageBrokerService.trackVotingDelayedMessage(nextMsgData, msgDelay);
		}
	}

	getById(id: string) {
		return this.proposalRepository.findOne({ where: { id } });
	}

	getByIdWithRelations(id: string, relations: string[]) {
		return this.proposalRepository.findOne({ where: { id }, relations });
	}

	async getAll(request: DaoProposalsRequest) {
		const { offset = 0, limit = 20, search = '' } = request;

		const queryBuilder = this.proposalRepository.createQueryBuilder('proposals');
		queryBuilder.leftJoinAndSelect('proposals.votes', 'votes');
		queryBuilder.offset(offset);
		queryBuilder.limit(limit);

		queryBuilder.where('proposals.daoId = :daoId', { daoId: request.daoId });

		const normalizedSearch = normalizeSearchQuery(search);

		if (normalizedSearch) {
			queryBuilder.andWhere('proposals.name ilike :nameSearch', { nameSearch: `%${normalizedSearch}%` });
		}

		const { status } = request;
		if (status) {
			if (status === ProposalStatus.pending) {
				queryBuilder.andWhere('proposals.startAt > now()');
			}
			if (status === ProposalStatus.active) {
				queryBuilder.andWhere('proposals.startAt <= now()');
				queryBuilder.andWhere('proposals.endAt >= now()');
			}
			if (status === ProposalStatus.closed) {
				queryBuilder.andWhere('proposals.endAt < now()');
			}
		}

		queryBuilder.orderBy('proposals.endAt', 'DESC');

		const count = await queryBuilder.getCount();
		const items = await queryBuilder.getMany();

		return {
			count,
			items
		};
	}
}
