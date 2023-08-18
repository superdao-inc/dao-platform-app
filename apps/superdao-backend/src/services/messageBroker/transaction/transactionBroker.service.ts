import { Injectable } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';

import { rabbitMqService } from 'src/services';
import { transactionKey } from 'src/constants';
import {
	AirdropMessage,
	AirdropNftRewardMessage,
	BanMessage,
	BuyAllowanceMessage,
	BuyNftMessage,
	BuyWhitelistNftMessage,
	ChangeMemberRoleMessage,
	ClaimNftMessage,
	CreateDaoMessage,
	MessageType,
	NftAdminUpdateCollectionMessage,
	NftAdminUpdateSaleMessage,
	ReferralClaimNftMessage,
	TransactionMessage,
	WhitelistAddMessage,
	WhitelistClaimMessage,
	WhitelistRemoveMessage
} from 'src/entities/blockchain/types';
import { ProducerService } from 'src/services/kafka/producer.service';

@Injectable()
export class TransactionBrokerService {
	constructor(private readonly producerService: ProducerService) {}

	async initTransactionsConsumer(
		queue: string,
		consumerTag: string,
		processor: (msg: ConsumeMessage, ackCallback: () => void, nackCallback: () => void) => Promise<void>
	) {
		await rabbitMqService.createConsumer(queue, consumerTag, processor);
	}

	// kafka transactions
	// handler: apps/superdao-backend/src/services/consumers/consumers.service.ts
	async trackKafkaTransaction(msg: TransactionMessage) {
		await this.producerService.publishTransaction(msg);
	}

	// scenarios
	// success: apps/superdao-backend/src/entities/dao/dao.service.ts#createDaoContractSuccess
	// fail: apps/superdao-backend/src/entities/dao/dao.service.ts#createDaoContractFailed
	async trackCreateDaoTransaction(data: CreateDaoMessage['data']) {
		const msg: CreateDaoMessage = {
			type: MessageType.CREATE_DAO,
			data
		};

		await this.trackKafkaTransaction(msg);
	}

	// rabbitMQ transactions
	// handler: apps/superdao-backend/src/services/consumers/consumers.service.ts
	async trackRabbitMQTransaction(msg: TransactionMessage) {
		await rabbitMqService.sendMessage(transactionKey, msg);
	}

	// scenarios
	// success: apps/superdao-backend/src/services/consumers/consumers.service.ts#nftAllowanceSuccess
	// fail: apps/superdao-backend/src/services/consumers/consumers.service.ts#nftAllowanceFailed
	async processAllowanceTransaction(data: BuyAllowanceMessage['data']) {
		const msg: BuyAllowanceMessage = {
			type: MessageType.BUY_ALLOWANCE,
			data
		};

		await this.trackRabbitMQTransaction(msg);
	}

	// scenarios
	// success: apps/superdao-backend/src/services/consumers/consumers.service.ts#banMemberSuccess
	// fail: apps/superdao-backend/src/services/consumers/consumers.service.ts#banMemberFailed
	async trackBanTransaction(data: BanMessage['data'], shouldBurn: boolean) {
		const msg: BanMessage = {
			type: shouldBurn ? MessageType.BURN : MessageType.BAN,
			data
		};

		await this.trackRabbitMQTransaction(msg);
	}

	// scenarios
	// success: apps/superdao-backend/src/entities/daoMembership/daoMembership.service.ts#changeMemberRoleSuccess
	// fail: apps/superdao-backend/src/entities/daoMembership/daoMembership.service.ts#changeMemberRoleFail
	async trackChangeMemberRoleTransaction(data: ChangeMemberRoleMessage['data']) {
		const msg: ChangeMemberRoleMessage = {
			type: MessageType.CHANGE_MEMBER_ROLE,
			data
		};

		await this.trackRabbitMQTransaction(msg);
	}

	// scenarios
	// success: apps/superdao-backend/src/entities/nft/nftCollections.service.ts#airdropSuccess
	// fail: apps/superdao-backend/src/entities/nft/nftCollections.service.ts#airdropFailed
	async trackAirdropTransaction(data: AirdropMessage['data']) {
		const msg: AirdropMessage = {
			type: MessageType.AIRDROP,
			data
		};

		await this.trackRabbitMQTransaction(msg);
	}

	// scenarios
	// success: apps/superdao-backend/src/entities/nft/nft.service.ts#saveClaimWhitelistSuccess
	// fail: - apps/superdao-backend/src/entities/nft/nft.service.ts#saveClaimWhitelistFail
	async trackWhitelistClaimTransaction(data: WhitelistClaimMessage['data']) {
		const msg: WhitelistClaimMessage = {
			type: MessageType.WHITELIST_CLAIM,
			data
		};

		await this.trackRabbitMQTransaction(msg);
	}

	// scenarios
	// success: apps/superdao-backend/src/entities/nft/nft.service.ts#buyNftSuccess
	// fail: apps/superdao-backend/src/entities/nft/nft.service.ts#buyNftFail
	async trackBuyNftTransaction(data: BuyNftMessage['data']) {
		const msg: BuyNftMessage = {
			type: MessageType.BUY_NFT,
			data
		};

		await this.trackRabbitMQTransaction(msg);
	}

	// scenarios
	// success: apps/superdao-backend/src/entities/nft/nft.service.ts#buyWhitelistNftSuccess
	// fail: apps/superdao-backend/src/entities/nft/nft.service.ts#buyWhitelistNftFail
	async trackBuyWhitelistNftTransaction(data: BuyWhitelistNftMessage['data']) {
		const msg: BuyWhitelistNftMessage = {
			type: MessageType.BUY_WHITELIST_NFT,
			data
		};

		await this.trackRabbitMQTransaction(msg);
	}

	// scenarios
	// success: apps/superdao-backend/src/entities/nft/nft.service.ts#claimNftSuccess
	// fail: apps/superdao-backend/src/entities/nft/nft.service.ts#claimNftFail
	async trackClaimNftTransaction(data: ClaimNftMessage['data'], isLinkClaim: boolean) {
		const msg: ClaimNftMessage = {
			type: isLinkClaim ? MessageType.LINK_CLAIM_NFT : MessageType.CLAIM_NFT,
			data
		};

		await this.trackRabbitMQTransaction(msg);
	}

	// scenarios
	// success: apps/superdao-backend/src/entities/nftAdmin/nftAdmin.service.ts#updateCollectionSuccess
	// fail: apps/superdao-backend/src/entities/nftAdmin/nftAdmin.service.ts#updateCollectionFail
	async trackNftAdminUpdateCollectionTransaction(data: NftAdminUpdateCollectionMessage['data']) {
		const msg: NftAdminUpdateCollectionMessage = {
			type: MessageType.NFT_ADMIN_UPDATE_COLLECTION,
			data
		};

		await this.trackRabbitMQTransaction(msg);
	}

	// scenarios
	// success: apps/superdao-backend/src/entities/nftAdmin/nftAdmin.service.ts#updateSaleSuccess
	// fail: apps/superdao-backend/src/entities/nftAdmin/nftAdmin.service.ts#updateSaleFail
	async trackNftAdminUpdateSaleTransaction(data: NftAdminUpdateSaleMessage['data']) {
		const msg: NftAdminUpdateSaleMessage = {
			type: MessageType.NFT_ADMIN_UPDATE_SALE,
			data
		};

		await this.trackRabbitMQTransaction(msg);
	}

	// scenarios
	// success: apps/superdao-backend/src/entities/referral/referral.service.ts#claimNftSuccess
	// fail: apps/superdao-backend/src/entities/referral/referral.service.ts#claimNftFail
	async trackReferralClaimNftTransaction(data: ReferralClaimNftMessage['data']) {
		const msg: ReferralClaimNftMessage = {
			type: MessageType.REFERRAL_CLAIM_NFT,
			data
		};

		await this.trackRabbitMQTransaction(msg);
	}

	// scenarios
	// success: apps/superdao-backend/src/entities/whitelist/whitelist.service.ts#whitelistRemoveSuccess
	// fail: apps/superdao-backend/src/entities/whitelist/whitelist.service.ts#whitelistRemoveFailed
	async trackWhitelistRemoveTransaction(data: WhitelistRemoveMessage['data']) {
		const msg: WhitelistRemoveMessage = {
			type: MessageType.WHITELIST_REMOVE,
			data
		};

		await this.trackRabbitMQTransaction(msg);
	}

	// scenarios
	// success: apps/superdao-backend/src/entities/whitelist/whitelist.service.ts#whitelistAddSuccess
	// fail: apps/superdao-backend/src/entities/whitelist/whitelist.service.ts#whitelistAddFailed
	async trackWhitelistAddTransaction(data: WhitelistAddMessage['data']) {
		const msg: WhitelistAddMessage = {
			type: MessageType.WHITELIST_ADD,
			data
		};

		await this.trackRabbitMQTransaction(msg);
	}

	// scenarios
	// success: apps/superdao-backend/src/services/webhook/webhook.service.ts#airdropNftRewardSuccess
	// fail: apps/superdao-backend/src/services/webhook/webhook.service.ts#airdropNftRewardFail
	async trackAirdropNftRewardTransaction(data: AirdropNftRewardMessage['data']) {
		const msg: AirdropNftRewardMessage = {
			type: MessageType.AIRDROP_NFT_REWARD,
			data
		};

		await this.trackRabbitMQTransaction(msg);
	}
}
