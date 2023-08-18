import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { WhitelistService } from 'src/entities/whitelist/whitelist.service';
import { getDataFromWebhookFormMessageBody, getRewardTierId } from 'src/services/webhook/utils';
import { WebhookFormMessageBodyData } from 'src/services/webhook/webhook.types';
import { NftService } from 'src/entities/nft/nft.service';
import { DaoService } from 'src/entities/dao/dao.service';
import { AirdropNftRewardMessage, MessageData } from 'src/entities/blockchain/types';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
import { NotFoundError } from 'src/exceptions';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user/user.model';
import { ILike, Repository } from 'typeorm';
import { TransactionBrokerService } from 'src/services/messageBroker/transaction/transactionBroker.service';
import { EmailService } from 'src/services/email/email.service';

@Injectable()
export class WebhookService {
	private readonly logger = new Logger(WebhookService.name);

	constructor(
		private readonly whitelistService: WhitelistService,
		private readonly nftService: NftService,
		private readonly daoService: DaoService,
		private readonly daoMembershipService: DaoMembershipService,
		private readonly transactionBrokerService: TransactionBrokerService,
		private readonly emailService: EmailService,
		@InjectRepository(User) private userRepository: Repository<User>
	) {}

	async sendClaimLink(daoAddress: string, email: string, tier: string) {
		if (!daoAddress?.length || !email?.length || !tier) {
			throw new Error('sendClaimLinks: one of required params is not provided');
		}

		try {
			this.logger.log(`sendClaimLinks: Sending ${tier} tier to ${email}`);

			const dao = await this.daoService.getByAddress(daoAddress);

			if (!dao) {
				this.logger.error(`sendClaimLinks: can't find dao by address ${dao}`);
				throw new Error(`sendClaimLinks: can't find dao by address ${dao}`);
			}

			return this.whitelistService.updateWhitelistEmailClaimParticipants(
				[{ email, tiers: [tier], walletAddress: '' }],
				dao.id
			);
		} catch (e: any) {
			this.logger.error(e?.message);
			throw new Error(e);
		}
	}

	async airdropNftReward(daoAddress: string, email: string, walletAddress: string, tier: string) {
		this.logger.log(
			`airdropNftReward call: daoId: ${JSON.stringify({ daoId: daoAddress, email, walletAddress, tier })}`
		);

		if (!daoAddress?.length || !email?.length || !walletAddress?.length || !tier) {
			throw new Error('airdropNftReward: one of required params is not provided');
		}

		try {
			this.logger.log(`airdropNftReward: daoAddress: ${daoAddress}`);

			if (!daoAddress) {
				this.logger.error(`airdropNftReward: daoAddress is not defined`);
				throw new Error('daoAddress is not defined');
			}

			this.logger.log(
				`airdropNftReward: daoAddress is ${daoAddress}. Sending ${tier} tier to ${walletAddress} (email to notify: ${email})`
			);

			const tx = await this.nftService.mintAndDeployDaoByGnosis(daoAddress, walletAddress, tier, false);

			if (!tx) {
				throw Error('airdropNftReward: transaction is not exist');
			}

			this.logger.log(`airdropNftReward: ${JSON.stringify(tx)}`);

			const msgData: AirdropNftRewardMessage['data'] = {
				transactionHash: tx.hash,
				daoAddress,
				walletAddress,
				email,
				tier
			};

			this.transactionBrokerService.trackAirdropNftRewardTransaction(msgData).finally();
		} catch (e: any) {
			throw new Error(e);
		}
	}

	async sendNftReward(daoAddress: string, data: WebhookFormMessageBodyData) {
		this.logger.log(`sendNftReward call: ${JSON.stringify({ daoId: daoAddress, data })}`);

		const { email, walletAddress, result } = getDataFromWebhookFormMessageBody(data);

		const tier = getRewardTierId(daoAddress, result);

		this.logger.log(
			`sendNftReward: tier: ${tier}, email: ${email}, result: ${result}, walletAddress: ${walletAddress}`
		);

		try {
			return walletAddress
				? this.airdropNftReward(daoAddress, email, walletAddress, tier)
				: this.sendClaimLink(daoAddress, email, tier);
		} catch (e) {
			throw new HttpException('Error while trying to trigger webhook ', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	async airdropNftRewardSuccess(data: MessageData['AIRDROP_NFT_REWARD']) {
		const { walletAddress, email, daoAddress, tier } = data;

		let user: User | null;
		user = await this.userRepository.findOneBy({ walletAddress: ILike(walletAddress) });
		if (!user) {
			user = await this.userRepository.save({ walletAddress, email });
		}
		if (user && !user.email) await this.userRepository.update({ id: user.id }, { email });

		const dao = await this.daoService.getByAddress(daoAddress);

		if (!dao) throw new NotFoundError(`airdropNftRewardSuccess: DAO with address ${daoAddress} not found`);

		this.daoMembershipService.addMember(dao.id, user.id, DaoMemberRole.Member, tier).finally();

		this.emailService
			.sendNftSuccessMessage([email], {
				daoName: dao.name,
				daoSlug: dao.slug,
				walletAddress
			})
			.finally();
	}

	async airdropNftRewardFail(data: MessageData['AIRDROP_NFT_REWARD']) {
		// TODO: handle fail scenario
		this.logger.error(`airdropNftRewardFail: ${JSON.stringify(data)}`);
	}
}
