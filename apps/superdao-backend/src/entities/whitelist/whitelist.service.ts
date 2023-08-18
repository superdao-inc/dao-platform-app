import { formatBytes32String, keccak256, solidityKeccak256 } from 'ethers/lib/utils';
import { MerkleTree } from 'merkletreejs';
import { DataSource, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { MessageData } from 'src/entities/blockchain/types';

import { NotFoundError, ValidationError } from 'src/exceptions';
import { EnsResolver } from 'src/services/the-graph/ens/ensResolver';
import { SocketService } from 'src/services/socket/socket.service';
import { DaoService } from 'src/entities/dao/dao.service';
import { EmailService } from 'src/services/email/email.service';
import { getMailingListWithClaimWhitelistParams } from 'src/services/email/utils/getMailingList';
import { CollectionsService } from 'src/entities/collections/collections.service';
import { normalizeSearchQuery } from 'src/utils/normalizeSearchQuery';
import { WhitelistParticipant, WhitelistParticipantsRequest, WhitelistTargetsEnum } from './whitelist.types';
import { Cover, getDefinedValues, isAddressesList, isENS, MessageName } from '@sd/superdao-shared';
import { Whitelist } from './whitelist.model';
import { UserService } from '../user/user.service';
import { CollectionTierInfo } from '../nft/nft.types';

@Injectable()
export class WhitelistService {
	private readonly logger = new Logger(WhitelistService.name);

	constructor(
		@InjectDataSource() private dataSource: DataSource,
		@InjectRepository(Whitelist) private readonly whitelistRepository: Repository<Whitelist>,
		private readonly userService: UserService,
		private readonly daoService: DaoService,
		private readonly emailService: EmailService,
		private readonly collectionsService: CollectionsService,
		private readonly socketService: SocketService
	) {}

	async whitelistAddSuccess(data: MessageData['WHITELIST_ADD']) {
		const { whitelist, daoId, daoSlug, daoAddress, userToNotify } = data;

		await this.updateWhitelistSaleParticicpants(whitelist, daoAddress);

		this.socketService.sendPrivateMessage(userToNotify, MessageName.WHITELIST_SUCCESS, {
			daoId,
			daoSlug,
			daoAddress,
			walletsCount: whitelist.length
		});
	}

	whitelistAddFailed(data: MessageData['WHITELIST_ADD']) {
		const { whitelist, daoId, daoSlug, daoAddress, userToNotify } = data;

		this.socketService.sendPrivateMessage(userToNotify, MessageName.WHITELIST_FAIL, {
			daoId,
			daoSlug,
			daoAddress,
			walletsCount: whitelist.length
		});
	}

	async whitelistRemoveSuccess(data: MessageData['WHITELIST_REMOVE']) {
		const { userToNotify, daoId, userToBan } = data;
		await this.removeWallet(daoId, userToBan.id);

		this.socketService.sendPrivateMessage(userToNotify, MessageName.REMOVE_WHITELIST_SUCCESS, {
			daoId,
			walletAddress: userToBan.walletAddress,
			displayName: userToBan.walletAddress
		});
	}

	whitelistRemoveFailed(data: MessageData['WHITELIST_REMOVE']) {
		const { userToNotify, daoId, userToBan } = data;
		this.socketService.sendPrivateMessage(userToNotify, MessageName.REMOVE_WHITELIST_FAILED, {
			daoId,
			walletAddress: userToBan.walletAddress,
			displayName: userToBan.walletAddress
		});
	}

	async updateWhitelistSaleParticicpants(whitelist: WhitelistParticipant[], daoAddress: string) {
		const dao = await this.daoService.getByAddress(daoAddress);
		if (!dao) throw new NotFoundError('Not found dao with selected contract address');

		if (!isAddressesList(getDefinedValues(whitelist, ({ walletAddress }) => walletAddress))) {
			throw new ValidationError('Whitelist include wrong addresses');
		}

		try {
			await this.userService.sendWhitelistEmails(whitelist, dao);
		} catch (error) {
			this.logger.error('Sending email failed: ', error);
		}

		this.updateParticipants(dao.id, whitelist, WhitelistTargetsEnum.sale);
	}

	async updateWhitelistEmailClaimParticipants(whitelist: WhitelistParticipant[], daoId: string) {
		const result = await this.updateParticipants(daoId, whitelist, WhitelistTargetsEnum.emailClaim);

		try {
			await this.sendEmailClaimWhitelistEmails(result?.raw, daoId);
		} catch (error) {
			this.logger.error('sendEmailClaimWhitelistEmails failed: ', error);
		}
	}

	buildMerkleTree(whitelist: WhitelistParticipant[]): MerkleTree {
		const solidityWhitelist = whitelist.reduce<string[]>((acc, item) => {
			// [address, tier, walletLimit, walletPrice] -> TODO: add walletLimit and walletPrice
			const leafTypes = ['address', 'bytes', 'uint256', 'uint256'];

			if (!item.tiers.length) {
				acc.push(solidityKeccak256([leafTypes[0]], [item.walletAddress]));
			}

			item.tiers.forEach((tier) =>
				acc.push(
					solidityKeccak256([leafTypes[0], leafTypes[1]], [item.walletAddress, formatBytes32String(tier.toUpperCase())])
				)
			);
			return acc;
		}, []);

		return new MerkleTree(solidityWhitelist, keccak256, { sort: true });
	}

	async getMerkleTreeProof(daoAddress: string, walletAddress: string, tier: string) {
		const dao = await this.daoService.getByAddress(daoAddress);

		if (!dao) {
			return false;
		}

		const whitelist = await this.getSaleWhitelist(dao.id);

		const merkleTree = this.buildMerkleTree(whitelist);

		const elementTier = solidityKeccak256(
			['address', 'bytes'],
			[walletAddress, formatBytes32String(tier.toUpperCase())]
		);
		const elementAnyTier = solidityKeccak256(['address'], [walletAddress]);

		const proofTier = merkleTree.getProof(elementTier);
		const proofAnyTier = merkleTree.getProof(elementAnyTier);

		const hexProofTier = merkleTree.getHexProof(elementTier);
		const hexProofAnyTier = merkleTree.getHexProof(elementAnyTier);

		return {
			merkleTree,
			elementTier,
			elementAnyTier,
			proofTier,
			proofAnyTier,
			hexProofTier,
			hexProofAnyTier
		};
	}

	async getVerifyWhitelistAddress(daoAddress: string, walletAddress: string, tier: string) {
		const merkleTreeProofs = await this.getMerkleTreeProof(daoAddress, walletAddress, tier);

		if (!merkleTreeProofs) {
			return false;
		}

		const { merkleTree, elementAnyTier, elementTier, proofTier, proofAnyTier } = merkleTreeProofs;

		const rootHash = merkleTree.getHexRoot();

		const isValidTier = MerkleTree.verify(proofTier, elementTier, rootHash, keccak256, {
			sort: true
		});
		const isValidAnyTier = MerkleTree.verify(proofAnyTier, elementAnyTier, rootHash, keccak256, {
			sort: true
		});

		return isValidAnyTier || isValidTier;
	}

	async findManyByWalletAddress(daoId: string, walletAddresses: string[], target: WhitelistTargetsEnum) {
		return await this.whitelistRepository
			.createQueryBuilder('whitelists')
			.where('whitelists.daoId = :daoId', { daoId })
			.andWhere('whitelists.target = :target', { target })
			.andWhere('LOWER(whitelists.walletAddress) IN (:...walletAddresses)', {
				walletAddresses
			})
			.getMany();
	}

	async findById(id: string) {
		return this.whitelistRepository.findOne({ where: { id } });
	}

	async findByDaoIdAndTarget(daoId: string, target: string) {
		return this.whitelistRepository.find({
			where: { daoId, target }
		});
	}

	async getSaleWhitelist(daoId: string) {
		return this.findByDaoIdAndTarget(daoId, WhitelistTargetsEnum.sale);
	}

	async updateParticipants(daoId: string, whitelist: WhitelistParticipant[], target: WhitelistTargetsEnum) {
		const parsedWhitelist = whitelist.map((wl) => ({
			...wl,
			daoId,
			walletAddress: wl.walletAddress?.toLowerCase(),
			target
		}));

		if (target === WhitelistTargetsEnum.emailClaim) {
			return await this.whitelistRepository.insert(parsedWhitelist);
		}

		if (target === WhitelistTargetsEnum.sale) {
			const whitelistAddresses = parsedWhitelist.map((wl) => wl.walletAddress);
			const participantsFromDb = await this.findManyByWalletAddress(daoId, whitelistAddresses, target);
			const participantsFromDbMap = new Map(
				participantsFromDb.map((participant) => [participant.walletAddress, participant])
			);

			const upsertParticipant = parsedWhitelist.map((participant) => {
				const rowId = participantsFromDbMap.get(participant.walletAddress)?.id;

				return {
					...(rowId ? { id: rowId } : {}),
					...participant,
					tiers: participant.tiers,
					email: participant.email
				};
			});

			return await this.dataSource.transaction(async (manager) => {
				await manager.upsert<Whitelist>(Whitelist, upsertParticipant, ['id']);
			});
		}
	}

	async removeWallet(daoId: string, userId: string) {
		const participant = await this.whitelistRepository.find({ where: { daoId, id: userId } });
		if (!participant) throw new NotFoundError('Whitelist participant  not found');

		try {
			await this.dataSource.transaction(async (manager) => {
				await manager.remove<Whitelist>(Whitelist, participant);
			});
		} catch (e: any) {
			throw new NotFoundError('Remove whitelist dao transaction failed');
		}
	}

	async createGetWhitelistParticipantQuery(request: WhitelistParticipantsRequest) {
		const { daoId, offset = 0, limit = 20, search = '', target } = request;

		const query = await this.whitelistRepository.createQueryBuilder('whitelists');

		query.where('whitelists.daoId = :daoId', { daoId });
		query.andWhere('whitelists.target = :target', { target });
		query.offset(offset);
		query.limit(limit);

		let normalizedSearch = normalizeSearchQuery(search);
		if (normalizedSearch) {
			if (isENS(normalizedSearch)) {
				normalizedSearch = (await EnsResolver.resolve(normalizedSearch)) || '';
			}

			query.andWhere('whitelists.walletAddress ilike :searchQuery', { searchQuery: `%${normalizedSearch}%` });
		}

		return query;
	}

	async getEmailWhitelistByDaoId(daoId: string) {
		return this.whitelistRepository.find({
			where: { daoId, target: WhitelistTargetsEnum.emailClaim }
		});
	}

	async getIdWhitelistParticipantByEmailAndTier(email: string, daoId: string, tiers: string) {
		return this.whitelistRepository.findOne({
			where: { daoId, email, target: WhitelistTargetsEnum.emailClaim, tiers: `{${tiers}}` }
		});
	}

	async getRecordById(id: string) {
		const record = await this.whitelistRepository.findOne({
			where: { id }
		});

		return record;
	}

	async sendEmailClaimWhitelistEmails(participants: Whitelist[], daoId: string) {
		const dao = await this.daoService.getById(daoId);
		if (!dao) return new NotFoundError(`DAO ${daoId} not found`);

		const seed = dao.id ? dao.id.split('').reverse().join() : 'peachpuff';

		const tiersInfo = {} as Record<string, CollectionTierInfo>;
		await Promise.all(
			participants.map(async (participant) => {
				const tier = (await this.collectionsService.getCollectionInfoByTier(dao.contractAddress!, participant.tiers[0]))
					.value;
				//@ts-ignore
				tiersInfo[participant.tiers[0]] = tier;
			})
		);

		const { emails, variables } = getMailingListWithClaimWhitelistParams(participants, tiersInfo);

		this.emailService.sendWhitelistEmailClaimMessage(emails, variables, {
			daoSlug: dao.slug,
			daoName: dao.name,
			daoDescription: dao.description,
			daoAvatar: dao.avatar
				? `https://ucarecdn.com/${dao.avatar}/-/preview/-/quality/smart/`
				: Cover.generateCoverGradient(seed),
			hasDaoAvatar: Boolean(dao.avatar)
		});
	}

	async updateRecord(id: string, options: Partial<Whitelist>) {
		return this.whitelistRepository.update({ id }, { ...options });
	}
}
