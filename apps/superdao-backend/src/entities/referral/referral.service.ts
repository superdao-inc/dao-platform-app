import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, In, Repository } from 'typeorm';
import { formatBytes32String } from 'ethers/lib/utils';
import { customAlphabet } from 'nanoid';
import { ContractService } from '../contract/contract.service';
import { ReferralLink } from './models/referralLink.model';

import { ReferralCampaign } from './models/referralCampaign.model';
import { EthersService } from 'src/services/ethers/ethers.service';
import { ReferralClaimNftMessage, ReferralClaimNftMessageData } from '../blockchain/types';
import { SocketService } from 'src/services/socket/socket.service';
import { CacheService, getCollectionsKey, getCollectionTierKey, getUserNftsKey } from 'src/services/cache';
import {
	AmbassadorStatus,
	MessageName,
	ReferralClaimNftSuccessMessageBody,
	ReferralMessage
} from '@sd/superdao-shared';
import { DaoMembershipService } from '../daoMembership/daoMembership.service';
import { DaoMemberRole } from '../daoMembership/daoMembership.types';
import { NotFoundError } from 'src/exceptions';
import { DaoService } from 'src/entities/dao/dao.service';
import { UserService } from '../user/user.service';
import { ReferralMember } from './models/referralMember.model';
import { DaoMembership } from '../daoMembership/daoMembership.model';
import { NftClientService } from '../nft/nft-client.service';
import { TransactionBrokerService } from 'src/services/messageBroker/transaction/transactionBroker.service';
import { TransactionsLoggingService } from '../logging/logging.service';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 8);

@Injectable()
export class ReferralService {
	constructor(
		private dataSource: DataSource,
		@InjectRepository(ReferralCampaign) private referralCampaignRepository: Repository<ReferralCampaign>,
		@InjectRepository(ReferralLink) private referralLinkRepository: Repository<ReferralLink>,
		@InjectRepository(ReferralMember) private referralMemberRepository: Repository<ReferralMember>,
		private readonly contractService: ContractService,
		private readonly socketService: SocketService,
		private readonly cacheService: CacheService,
		private readonly daoMembershipService: DaoMembershipService,
		private readonly daoService: DaoService,
		private readonly userService: UserService,
		private readonly nftClientService: NftClientService,
		private readonly ethersService: EthersService,
		private readonly transactionBrokerService: TransactionBrokerService,
		private readonly transactionsLoggingService: TransactionsLoggingService
	) {}

	async campaignById(id: string) {
		return this.referralCampaignRepository.findOneBy({ id });
	}

	async campaignByShortId(shortId: string) {
		return this.referralCampaignRepository.findOneBy({ shortId });
	}

	async isClaimAvailableBySecret(claimSecret: string) {
		const link = await this.referralLinkRepository.findOneBy({
			id: claimSecret
		});

		return !!link && !link.ambassadorWallet;
	}

	async getAmbassadorStatus(
		referralCampaignId: string,
		daoId: string,
		walletAddress: string,
		ambassadorNftTierId: string,
		claimSecret: string | null = null
	) {
		const dao = await this.daoService.getById(daoId);
		if (!dao?.contractAddress) throw new NotFoundError('DAO or contractAddress not found');
		const hasThisNft = await this.nftClientService.checkUserHasNft(dao.contractAddress, walletAddress, [
			ambassadorNftTierId
		]);
		if (hasThisNft) return AmbassadorStatus.HAS_AMBASSADOR_NFT;

		if (claimSecret) {
			if (await this.isClaimAvailableBySecret(claimSecret)) {
				return AmbassadorStatus.CLAIM_AVAILABLE;
			}
		}

		const links = await this.linksByWallets([walletAddress], referralCampaignId);
		if (links.length) {
			return AmbassadorStatus.CLAIM_AVAILABLE;
		}

		return AmbassadorStatus.NOT_ELIGIBLE;
	}

	async linksByWallets(wallets: string[], referralCampaignId?: string) {
		return this.referralLinkRepository.findBy({
			ambassadorWallet: ILike(In(wallets)),
			referralCampaignId
		});
	}

	async linkByShortId(shortId: string) {
		const query = this.referralLinkRepository.createQueryBuilder('referralLink');
		query.where('referralLink.shortId = :shortId', { shortId });
		query.leftJoinAndSelect('referralLink.referralCampaign', 'referralCampaign');

		const referralLink = await query.getOne();

		return referralLink;
	}

	async updateLinkLimitLeft(referralLinkId: string) {
		await this.dataSource.transaction('SERIALIZABLE', async (manager) => {
			const link = await manager.findOneBy(ReferralLink, { id: referralLinkId });

			if (!link) throw Error(`referralLink ${referralLinkId} not found`);

			const linkUsedCount = await manager.count(ReferralMember, { where: { referralLinkId } });
			const limitLeft = link.limit - linkUsedCount;

			if (limitLeft < 0) throw Error(`referralLink ${referralLinkId} limitLeft less than 0`);

			return manager.update(ReferralLink, { id: referralLinkId }, { limitLeft });
		});
	}

	async checkLinkHasLimitLeft(referralLinkId: string) {
		const link = await this.referralLinkRepository.findOneBy({ id: referralLinkId });
		if (!link) throw Error(`referralLink ${referralLinkId} not found`);

		return link.limitLeft > 0;
	}

	async claimAmbassadorNft(campaign: ReferralCampaign, to: string, userToNotify: string, claimSecret: string | null) {
		const { daoId, tier, id, defaultLimit } = campaign;
		const dao = await this.daoService.getById(daoId);
		if (!dao?.contractAddress) throw new NotFoundError('DAO not found or has no contract');

		const status = await this.getAmbassadorStatus(id, daoId, to, tier, claimSecret);
		if (status === AmbassadorStatus.HAS_AMBASSADOR_NFT) {
			return { transactionInitiated: false, message: ReferralMessage.CLAIM_NFT_FAIL_HAS_NFT };
		} else if (status === AmbassadorStatus.NOT_ELIGIBLE) {
			return { transactionInitiated: false };
		}

		if (!(await this.nftClientService.checkTierHasFreeAmount(dao.contractAddress, tier))) {
			return { transactionInitiated: false, message: ReferralMessage.REFERRAL_FAIL_LIMIT };
		}

		const admin = await this.contractService.getAdminContract(dao.contractAddress);
		const mintTx = await admin.populateTransaction.mint(to, formatBytes32String(tier));
		const mintTxResponse = await this.ethersService.sendTransaction(mintTx);

		const msgData: ReferralClaimNftMessage['data'] = {
			transactionHash: mintTxResponse.hash,
			daoAddressClaimFrom: dao.contractAddress,
			userToNotify,
			tier,
			referralCampaignId: id,
			linkLimit: defaultLimit,
			claimSecret: claimSecret ?? undefined
		};

		this.transactionBrokerService.trackReferralClaimNftTransaction(msgData);

		await this.transactionsLoggingService.logRefferalClaimTransaction({
			executorId: userToNotify,
			transactionHash: mintTxResponse.hash,
			daoAddress: dao.contractAddress,
			tier,
			referralCampaignId: id,
			linkLimit: defaultLimit,
			claimSecret: claimSecret ?? undefined
		});

		return { transactionInitiated: true };
	}

	async claimReferralNft(
		daoId: string,
		toWallet: string,
		tier: string,
		referralLinkId: string,
		userToNotify: string,
		referralCampaignId: string,
		linkLimit: number
	) {
		const dao = await this.daoService.getById(daoId);
		if (!dao?.contractAddress) throw new NotFoundError('DAO not found or has no contract');

		if (await this.nftClientService.checkUserHasNft(dao.contractAddress, toWallet, [tier])) {
			return { transactionInitiated: false, message: ReferralMessage.CLAIM_NFT_FAIL_HAS_NFT };
		}

		if (
			!(await this.checkLinkHasLimitLeft(referralLinkId)) ||
			!(await this.nftClientService.checkTierHasFreeAmount(dao.contractAddress, tier))
		) {
			return { transactionInitiated: false, message: ReferralMessage.REFERRAL_FAIL_LIMIT };
		}

		const admin = await this.contractService.getAdminContract(dao.contractAddress);
		const mintTx = await admin.populateTransaction.mint(toWallet, formatBytes32String(tier));
		const mintTxResponse = await this.ethersService.sendTransaction(mintTx);

		const msgData: ReferralClaimNftMessage['data'] = {
			transactionHash: mintTxResponse.hash,
			daoAddressClaimFrom: dao.contractAddress,
			referralLinkId,
			userToNotify,
			tier,
			referralCampaignId,
			linkLimit
		};

		this.transactionBrokerService.trackReferralClaimNftTransaction(msgData);

		await this.transactionsLoggingService.logRefferalClaimTransaction({
			executorId: userToNotify,
			transactionHash: mintTxResponse.hash,
			daoAddress: dao.contractAddress,
			tier,
			referralCampaignId,
			linkLimit,
			referralLinkId
		});

		return { transactionInitiated: true };
	}

	async claimNftSuccess(data: ReferralClaimNftMessageData) {
		const { daoAddressClaimFrom, userToNotify, tier, referralLinkId, claimSecret, referralCampaignId, linkLimit } =
			data;

		const dao = await this.daoService.getByAddress(daoAddressClaimFrom);
		const user = await this.userService.getUserById(userToNotify);
		if (!user || !dao?.contractAddress) throw new NotFoundError('User or DAO not found or DAO has no contract');

		let membership: DaoMembership | undefined = (await this.daoMembershipService.findUserInDao(dao.id, user.id))[0];
		if (!membership) {
			membership = await this.daoMembershipService.addMember(dao.id, userToNotify, DaoMemberRole.Member, tier);
		}
		if (!membership) throw Error('DaoMembership not created');

		if (referralLinkId) await this.addReferralMember(referralLinkId, membership.id);

		// Recursive referral program: create referral link for ours fresh ambassador
		let isAmbassadorNow = false;
		if (claimSecret) {
			const link = await this.referralLinkRepository.findOneBy({
				id: claimSecret
			});
			if (!link) throw Error(`Provided claimSecret: ${claimSecret} not found`);
			link.ambassadorWallet = user.walletAddress;

			await link.save();

			isAmbassadorNow = true;
		} else {
			const { isRecursive = false } = (await this.campaignById(referralCampaignId)) || {};
			if (isRecursive) {
				await this.referralLinkRepository
					.create({
						shortId: nanoid(),
						ambassadorWallet: user.walletAddress,
						referralCampaignId,
						limit: linkLimit,
						limitLeft: linkLimit
					})
					.save();
				isAmbassadorNow = true;
			}
		}

		const redisUserNftsKeyFieldData = getUserNftsKey(user.walletAddress, dao.contractAddress);
		const redisCollectionTierKeyFieldData = getCollectionTierKey(dao.contractAddress, tier);

		await this.cacheService.hdel(redisUserNftsKeyFieldData.key, redisUserNftsKeyFieldData.field);
		await this.cacheService.hdel(redisCollectionTierKeyFieldData.key, redisCollectionTierKeyFieldData.field);
		await this.cacheService.del(getCollectionsKey(dao.contractAddress));

		const msgData: ReferralClaimNftSuccessMessageBody = { daoSlug: dao.slug, tier, isAmbassadorNow };
		this.socketService.sendPrivateMessage(userToNotify, MessageName.CLAIM_NFT_SUCCESS, msgData);
	}

	async claimNftFail(data: ReferralClaimNftMessageData) {
		this.socketService.sendPrivateMessage(data.userToNotify, MessageName.CLAIM_NFT_FAIL);
	}

	async addReferralMember(referralLinkId: string, daoMembershipId: string) {
		const params = {
			referralLinkId,
			daoMembershipId
		};

		try {
			const member = await this.referralMemberRepository.insert(params);
			await this.updateLinkLimitLeft(referralLinkId);

			return member;
		} catch (e: any) {
			throw Error(`Creation of referral member failed: ${JSON.stringify(params)}`);
		}
	}
}
