import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';

import { MessageName } from '@sd/superdao-shared';

import { delayedVotingEventKey, transactionKey } from 'src/constants';
import { NftCollectionsService } from 'src/services/index';
import { DelayedVotingEventMessage } from 'src/services/voting/types';
import { ProposalService } from 'src/entities/proposal/proposal.service';
import { MessageData, MessageType, TransactionMessage, TransactionStatus } from 'src/entities/blockchain/types';
import { ValidationError } from 'src/exceptions';
import { WhitelistService } from 'src/entities/whitelist/whitelist.service';
import { UserService } from 'src/entities/user/user.service';
import { NftService } from 'src/entities/nft/nft.service';
import { DaoService } from 'src/entities/dao/dao.service';
import { TransactionService } from 'src/entities/transaction/transaction.service';
import { SocketService } from 'src/services/socket/socket.service';
import { CacheService, getCollectionsKey, getCollectionTierKey, getUserNftsKey } from 'src/services/cache';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import { ReferralService } from 'src/entities/referral/referral.service';
import { NftAdminService } from 'src/entities/nftAdmin/nftAdmin.service';

import { CompositeBlockchainService } from '../blockchain/blockchain.service';
import { TransactionBrokerService } from '../messageBroker/transaction/transactionBroker.service';
import { DelayedMessageBrokerService } from '../messageBroker/delayedMessage/delayedMessage.service';
import { TransactionsLoggingService } from 'src/entities/logging/logging.service';

import { TransactionMetricsService } from 'src/services/transacton-metrics/transaction-metrics.service';
import { WebhookService } from 'src/services/webhook/webhook.service';

@Injectable()
export class ConsumersService implements OnModuleInit {
	private readonly logger = new Logger(ConsumersService.name);

	constructor(
		private readonly cacheService: CacheService,
		private readonly proposalService: ProposalService,
		private readonly whitelistService: WhitelistService,
		private readonly userService: UserService,
		private readonly nftService: NftService,
		private readonly nftCollectionsService: NftCollectionsService,
		private readonly daoService: DaoService,
		private readonly daoMembershipService: DaoMembershipService,
		private readonly transactionService: TransactionService,
		private readonly socketService: SocketService,
		private readonly referralService: ReferralService,
		private readonly nftAdminService: NftAdminService,
		private readonly compositeBlockchainService: CompositeBlockchainService,
		private readonly transactionBrokerService: TransactionBrokerService,
		private readonly delayedMessageBrokerService: DelayedMessageBrokerService,
		private readonly transactionMetricsService: TransactionMetricsService,
		private readonly transactionsLoggingService: TransactionsLoggingService,
		private readonly webhookService: WebhookService
	) {}

	async onModuleInit() {
		await this.delayedMessageBrokerService.initDelayedMessagesConsumer(
			delayedVotingEventKey,
			delayedVotingEventKey,
			this.processDelayedVotingEvent
		);

		await this.transactionBrokerService.initTransactionsConsumer(
			transactionKey,
			transactionKey,
			this.processRabbitTransaction
		);
	}

	private processRabbitTransaction = async (msg: ConsumeMessage, ackCallback: () => void, nackCallback: () => void) => {
		const msgContent: TransactionMessage = JSON.parse(msg.content.toString());

		return this.processTransaction(msgContent, ackCallback, nackCallback);
	};

	MAX_CHECK_TX_COUNT = 35;

	txCounter = new Map<string, number>();

	processTransaction = async (msgContent: TransactionMessage, ackCallback: () => void, nackCallback: () => void) => {
		const {
			data: { transactionHash },
			resendTimeout = 3000
		} = msgContent;

		const seenCount = this.txCounter.get(transactionHash) || 0;
		this.txCounter.set(transactionHash, seenCount + 1);

		const txStatus = seenCount > this.MAX_CHECK_TX_COUNT ? 'FAILED' : await this.checkStatus(transactionHash);

		switch (txStatus) {
			case 'AWAIT_CONFIRMATION': {
				setTimeout(() => {
					nackCallback();
				}, resendTimeout);
				return;
			}

			case 'FAILED': {
				ackCallback();
				this.txCounter.delete(transactionHash);
				try {
					await this.handleFailedTransaction(msgContent);
				} catch (error) {}
				return;
			}

			case 'FINALIZED': {
				ackCallback();
				this.txCounter.delete(transactionHash);
				try {
					await this.handleSuccessTransaction(msgContent);
				} catch (error) {}
				return;
			}

			default: {
				this.txCounter.delete(transactionHash);
				throw new ValidationError('Unknown status provided');
			}
		}
	};

	private async handleSuccessTransaction(msg: TransactionMessage) {
		this.logger.log('handleSuccessTransaction', { name: msg, hash: msg.data.transactionHash });

		const scenario = 'success';

		switch (msg.type) {
			case MessageType.BAN: {
				await this.banMemberSuccess(msg.data);
				await this.transactionsLoggingService.finalizeLogBanTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.BURN: {
				await this.burnNftSuccess(msg.data);
				await this.transactionsLoggingService.finalizeLogBanTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.WHITELIST_ADD: {
				await this.whitelistService.whitelistAddSuccess(msg.data);
				break;
			}

			case MessageType.WHITELIST_REMOVE: {
				await this.whitelistService.whitelistRemoveSuccess(msg.data);
				break;
			}

			case MessageType.AIRDROP: {
				await this.nftCollectionsService.airdropSuccess(msg.data);
				await this.transactionsLoggingService.finalizeLogAirdropTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.CREATE_DAO: {
				await this.daoService.createDaoContractSuccess(msg.data);
				break;
			}

			case MessageType.WHITELIST_CLAIM: {
				await this.nftService.saveClaimWhitelistSuccess(msg.data);
				await this.transactionsLoggingService.finalizeLogWhitelistTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.BUY_NFT: {
				await this.nftService.buyNftSuccess(msg.data);
				await this.transactionsLoggingService.finalizeLogBuyNftTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.BUY_WHITELIST_NFT: {
				await this.nftService.buyWhitelistNftSuccess(msg.data);
				await this.transactionsLoggingService.finalizeLogBuyNftTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.BUY_ALLOWANCE: {
				await this.nftAllowanceSuccess(msg.data);
				break;
			}

			case MessageType.CLAIM_NFT: {
				await this.nftService.claimNftSuccess(msg.data, false);
				await this.transactionsLoggingService.finalizeLogClaimNftTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.LINK_CLAIM_NFT: {
				await this.nftService.claimNftSuccess(msg.data, false);
				await this.transactionsLoggingService.finalizeLogClaimNftTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.REFERRAL_CLAIM_NFT: {
				await this.referralService.claimNftSuccess(msg.data);
				await this.transactionsLoggingService.finalizeLogRefferalClaimTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.CHANGE_MEMBER_ROLE: {
				await this.daoMembershipService.changeMemberRoleSuccess(msg.data);
				break;
			}

			case MessageType.NFT_ADMIN_UPDATE_COLLECTION: {
				await this.nftAdminService.updateCollectionSuccess(msg.data);
				break;
			}

			case MessageType.NFT_ADMIN_UPDATE_SALE: {
				await this.nftAdminService.updateSaleSuccess(msg.data);
				break;
			}

			case MessageType.AIRDROP_NFT_REWARD: {
				await this.webhookService.airdropNftRewardSuccess(msg.data);
				break;
			}

			default:
		}
	}

	private async handleFailedTransaction(msg: TransactionMessage) {
		this.logger.error('handleFailedTransaction', { name: msg.type, hash: msg.data.transactionHash });

		const scenario = 'fail';

		switch (msg.type) {
			case MessageType.BAN: {
				await this.banMemberFailed(msg.data);
				await this.transactionsLoggingService.finalizeLogBanTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.BURN: {
				await this.burnNftFailed(msg.data);
				await this.transactionsLoggingService.finalizeLogBanTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.WHITELIST_ADD: {
				await this.whitelistService.whitelistAddFailed(msg.data);
				break;
			}

			case MessageType.WHITELIST_REMOVE: {
				await this.whitelistService.whitelistRemoveFailed(msg.data);
				break;
			}

			case MessageType.AIRDROP: {
				await this.nftCollectionsService.airdropFailed(msg.data);
				await this.transactionsLoggingService.finalizeLogAirdropTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.CREATE_DAO: {
				this.daoService.createDaoContractFailed(msg.data);
				break;
			}

			case MessageType.WHITELIST_CLAIM: {
				await this.nftService.saveClaimWhitelistFail(msg.data);
				await this.transactionsLoggingService.finalizeLogWhitelistTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.BUY_NFT: {
				await this.nftService.buyNftFail(msg.data);
				await this.transactionsLoggingService.finalizeLogBuyNftTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.BUY_WHITELIST_NFT: {
				await this.nftService.buyWhitelistNftFail(msg.data);
				await this.transactionsLoggingService.finalizeLogBuyNftTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.BUY_ALLOWANCE: {
				await this.nftAllowanceFailed(msg.data);
				break;
			}

			case MessageType.LINK_CLAIM_NFT:
			case MessageType.CLAIM_NFT: {
				await this.nftService.claimNftFail(msg.data);
				await this.transactionsLoggingService.finalizeLogClaimNftTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.CHANGE_MEMBER_ROLE: {
				await this.daoMembershipService.changeMemberRoleFail(msg.data);
				break;
			}

			case MessageType.NFT_ADMIN_UPDATE_COLLECTION: {
				await this.nftAdminService.updateCollectionFail(msg.data);
				break;
			}

			case MessageType.NFT_ADMIN_UPDATE_SALE: {
				await this.nftAdminService.updateSaleFail(msg.data);
				break;
			}

			case MessageType.REFERRAL_CLAIM_NFT: {
				await this.referralService.claimNftFail(msg.data);
				await this.transactionsLoggingService.finalizeLogRefferalClaimTransaction({
					transactionHash: msg.data.transactionHash,
					scenario
				});
				break;
			}

			case MessageType.AIRDROP_NFT_REWARD: {
				await this.webhookService.airdropNftRewardFail(msg.data);
				break;
			}

			default:
		}
	}

	async banMemberSuccess(data: MessageData['BAN']) {
		const { userToNotify, daoId, userToBan, isGasless } = data;

		const dao = await this.daoService.getById(daoId);

		if (dao) {
			// important get tiers before invalidating cache
			if (dao.contractAddress) {
				const redisUserNftsKeyFieldData = getUserNftsKey(userToBan.walletAddress, dao.contractAddress);

				await this.cacheService.hdel(redisUserNftsKeyFieldData.key, redisUserNftsKeyFieldData.field);
				await this.cacheService.del(getCollectionsKey(dao.contractAddress));
				await this.cacheService.del(getCollectionTierKey(dao.contractAddress, '*').key);
			}

			await this.daoMembershipService.deleteMember(daoId, userToBan.id);

			this.transactionMetricsService.trackSuccessfulBanMember(isGasless);

			this.socketService.sendPrivateMessage(userToNotify, MessageName.BAN_MEMBER_SUCCESS, {
				daoId,
				walletAddress: userToBan.walletAddress,
				displayName: userToBan.displayName
			});
		}
	}

	async banMemberFailed(data: MessageData['BAN']) {
		const { userToNotify, daoId, userToBan, isGasless } = data;

		this.transactionMetricsService.trackFailedBanMember(isGasless);

		this.socketService.sendPrivateMessage(userToNotify, MessageName.BAN_MEMBER_FAILED, {
			daoId,
			walletAddress: userToBan.walletAddress,
			displayName: userToBan.displayName
		});
	}

	async burnNftSuccess(data: MessageData['BURN']) {
		const { userToNotify, daoId, userToBan } = data;

		const dao = await this.daoService.getById(daoId);

		if (dao) {
			// important get tiers before invalidating cache
			if (dao.contractAddress) {
				const redisKeyFieldData = getUserNftsKey(userToBan.walletAddress, dao.contractAddress);

				await this.cacheService.hdel(redisKeyFieldData.key, redisKeyFieldData.field);
				await this.cacheService.del(getCollectionsKey(dao.contractAddress));
				await this.cacheService.del(getCollectionTierKey(dao.contractAddress, '*').key);
			}

			this.socketService.sendPrivateMessage(userToNotify, MessageName.BURN_NFT_SUCCESS, {
				daoId,
				walletAddress: userToBan.walletAddress,
				displayName: userToBan.displayName
			});
		}
	}

	async burnNftFailed(data: MessageData['BURN']) {
		const { userToNotify, daoId, userToBan } = data;

		this.socketService.sendPrivateMessage(userToNotify, MessageName.BURN_NFT_FAILED, {
			daoId,
			walletAddress: userToBan.walletAddress,
			displayName: userToBan.displayName
		});
	}

	async nftAllowanceSuccess(data: MessageData['BUY_ALLOWANCE']) {
		const { userToNotify } = data;

		const user = await this.userService.getUserById(userToNotify);
		if (!user) {
			await this.nftAllowanceFailed(data);
			return;
		}

		const transaction = await this.transactionService.buyNftMulticurrencyOpenSaleTx(
			user.walletAddress,
			user,
			data.daoAddress,
			data.tier,
			data.tokenAddress
		);

		this.socketService.sendPrivateMessage(userToNotify, MessageName.BUY_ALLOWANCE_SUCCESS, { transaction });
	}

	async nftAllowanceFailed(data: MessageData['BUY_ALLOWANCE']) {
		const { userToNotify } = data;

		this.socketService.sendPrivateMessage(userToNotify, MessageName.BUY_ALLOWANCE_SUCCESS, {});
	}

	private async checkStatus(transactionHash: string): Promise<TransactionStatus> {
		return await this.compositeBlockchainService.checkTransactionStatus(transactionHash);
	}

	private processDelayedVotingEvent = async (msg: ConsumeMessage, ackCallback: () => void) => {
		const msgContent: DelayedVotingEventMessage = JSON.parse(msg.content.toString());

		try {
			await this.proposalService.handleVotingEvent(msgContent, ackCallback);
		} catch (e) {
			this.logger.error('handleVotingEvent', { e });
		}
	};
}
