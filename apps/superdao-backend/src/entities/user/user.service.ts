import { ethers } from 'ethers';
import { DeepPartial, Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import toLower from 'lodash/toLower';
import keyBy from 'lodash/keyBy';
import difference from 'lodash/difference';

// entities

import { Dao } from 'src/entities/dao/dao.model';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
import { DaoMembership } from 'src/entities/daoMembership/daoMembership.model';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';

// errors
import { NotFoundError } from 'src/exceptions';

// services
import { EmailService } from 'src/services/email/email.service';
import { EnsResolver } from 'src/services/the-graph/ens/ensResolver';
import { featureToggles } from 'src/services/featureToggles';

// types
import { AirdropParticipant, CollectionTierInfo, DaosMembersByNftData } from 'src/entities/nft/nft.types';

// utils
import { DEFAULT_NONCE } from 'src/constants';
import { PaginationWithSearch } from 'src/gql/pagination';
import {
	getMailingListWithWalletAddress,
	getMailingListWithWelcomeParams
} from 'src/services/email/utils/getMailingList';
import { normalizeSearchQuery } from 'src/utils/normalizeSearchQuery';
import { User } from './user.model';
import { Cover } from '@sd/superdao-shared';
import { DaoService } from '../dao/dao.service';
import { CollectionsService } from '../collections/collections.service';
import { Links } from '../links/links.model';
import { GraphClient } from 'src/services/the-graph/graph-polygon/graph.client';
import { CompositeBlockchainService } from 'src/services/blockchain/blockchain.service';

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);

	constructor(
		@InjectRepository(User) private userRepository: Repository<User>,
		@InjectRepository(Links) private linksRepository: Repository<Links>,
		@InjectRepository(DaoMembership) private daoMembershipRepository: Repository<DaoMembership>,
		private readonly collectionsService: CollectionsService,
		private readonly daoService: DaoService,
		private readonly daoMembershipService: DaoMembershipService,
		private readonly emailService: EmailService,
		private readonly graphClient: GraphClient,
		private readonly compositeBlockchainService: CompositeBlockchainService
	) {}

	// this code somehow comes earlier than feature toggles initialization, so we need to call function
	isAdminEmailsEnabled = () => featureToggles.isEnabled('admin_send_emails');

	async sendWelcomeEmails(users: Array<DeepPartial<User> & { tiers: string[] }>, dao: DeepPartial<Dao>) {
		const { id, name, slug, description, contractAddress } = dao;

		const seed = id ? id.split('').reverse().join() : 'peachpuff';

		const tiersInfo = {} as Record<string, CollectionTierInfo>;
		const tiersArtworkIds = {} as Record<string, number>;
		await Promise.all(
			users.map(async (user) => {
				const tier = (await this.collectionsService.getCollectionInfoByTier(dao.contractAddress!, user.tiers[0])).value;
				const artworksResponse = await this.compositeBlockchainService.getCollectionArtworks(
					dao.contractAddress!,
					user.tiers[0]
				);
				//@ts-ignore
				tiersInfo[user.tiers] = {
					...tier,
					artworks: artworksResponse?.artworks
				};
			})
		);

		await Promise.all(
			users.map(async (user) => {
				//@ts-ignore
				const tierByUser: CollectionTierInfo = tiersInfo?.[user?.tiers];

				const { artworkId } = await this.getMintedNftMeta(
					contractAddress || '',
					tierByUser?.id,
					user?.walletAddress || ''
				);

				//@ts-ignore
				tiersArtworkIds[user?.tiers] = artworkId;
			})
		);

		const { emails, variables } = getMailingListWithWelcomeParams(users, tiersInfo, tiersArtworkIds);

		this.emailService.sendWelcomeEmailMessage(emails, variables, {
			daoSlug: slug ?? '',
			daoName: name ?? '',
			daoDescription: description ?? '',
			daoAvatar: dao.avatar
				? `https://ucarecdn.com/${dao.avatar}/-/preview/-/quality/smart/`
				: Cover.generateCoverGradient(seed),
			hasDaoAvatar: Boolean(dao.avatar)
		});
	}

	async getMintedNftMeta(daoAddress: string, tier: string, walletAddress: string) {
		try {
			const nfts = await this.graphClient.getNftsByDao(daoAddress, tier, walletAddress);
			const { artworkID, tokenID = undefined } = nfts?.[0] || {};
			const artworkId = artworkID ? ethers.BigNumber.from(artworkID)?.toNumber() : undefined;

			return {
				artworkId,
				tokenId: tokenID
			};
		} catch (error) {
			this.logger.error(`[NFT Get Minted] Error while get minted nft`, { error, daoAddress, tier, walletAddress });

			return {
				artworkId: undefined,
				tokenId: undefined
			};
		}
	}

	async sendWhitelistEmails(users: DeepPartial<User>[], dao: DeepPartial<Dao>) {
		const { name, slug } = dao;

		const { emails, variables } = getMailingListWithWalletAddress(users);

		this.emailService.sendWhitelistEmailMessage(emails, variables, {
			daoSlug: slug ?? '',
			daoName: name ?? ''
		});
	}

	//TODO: refactor
	async saveUsersFromAirdrop(airdrop: AirdropParticipant[], daoAddress: string) {
		const dao = await this.daoService.getByAddress(daoAddress);
		if (!dao) throw new NotFoundError('Not found dao with selected contract address');

		// here we combine dashes by walletAddress, in the scenario when
		// [ { walletAddress: '123', tier: [1] }, { walletAddress: '123', tier: [2] } ]
		// [{walletAddress: '123', tier: [1,2] }]
		const mergedAddressAirdrop = airdrop.reduce((a, v) => {
			if (a[v.walletAddress]) {
				a[v.walletAddress].tiers = [...a[v.walletAddress].tiers, ...v.tiers];
			} else {
				a[v.walletAddress] = v;
			}
			return a;
		}, {} as Record<string, AirdropParticipant>);

		const lowerCasedAirdrop: AirdropParticipant[] = Object.values(mergedAddressAirdrop).map((w) => ({
			...w,
			walletAddress: w.walletAddress.toLowerCase()
		}));

		const airdropAddresses = lowerCasedAirdrop.map((w) => w.walletAddress);

		//берем список всех юзеров по аирдропу, что юы узнать каких нет
		const existingUsers = await this.findManyByWalletAddresses(airdropAddresses);
		const existingUsersByWalletsMap = new Map(existingUsers?.map((user) => [user.walletAddress, user]));

		//тут узнаем аких нет
		const nonExistingUserFromAirdrop = lowerCasedAirdrop.filter(
			(w) => !existingUsersByWalletsMap.get(w.walletAddress.toLowerCase())
		);

		const usersSendEmail = lowerCasedAirdrop.map((w) => {
			const emailExistingUser = existingUsersByWalletsMap.get(w.walletAddress)?.email ?? '';

			return {
				...w,
				email: w.email || emailExistingUser
			};
		});

		const newUsers: DeepPartial<User>[] = await Promise.all(
			nonExistingUserFromAirdrop.map(async (user): Promise<DeepPartial<User>> => {
				const resolvedAddress = user.walletAddress;
				const ens = await EnsResolver.resolve(resolvedAddress);

				const setEns = ens?.toLowerCase() === resolvedAddress.toLowerCase();

				return {
					ens: setEns ? null : ens,
					walletAddress: resolvedAddress,
					email: user.email || null,
					nonce: DEFAULT_NONCE
				};
			})
		);

		try {
			await this.sendWelcomeEmails(usersSendEmail, dao);
		} catch (error) {
			this.logger.error('Sending email failed: ', error);
		}

		await this.createMany(newUsers);

		//тут мы еще раз берем все адреса, потому что у них появились id, для того что бы вставить в membership
		const updatedUsers = await this.findManyByWalletAddresses(airdropAddresses);

		const existingMembers = await this.daoMembershipRepository.findBy({ daoId: dao.id });
		const existingMembersIds = existingMembers.map(({ userId }) => userId);

		const membersToAdd: { id: string; tiers?: string[] }[] = [];
		const membersToUpdate: { id: string; tiers?: string[] }[] = [];

		// Mapping tier to users:
		updatedUsers.forEach(({ id, walletAddress }) => {
			const w = lowerCasedAirdrop.find(
				({ walletAddress: wAddress }) => walletAddress.toLowerCase() === wAddress.toLowerCase()
			);

			const member = { id, tiers: w?.tiers };
			if (existingMembersIds.includes(id)) {
				membersToUpdate.push(member);
			} else {
				membersToAdd.push(member);
			}
		});

		await this.daoMembershipService.addManyMembers(dao.id, membersToAdd, DaoMemberRole.Member);
		await this.daoMembershipService.memberUpdateTiers(dao.id, membersToUpdate);
		await this.daoMembershipService.updateMembersCount(dao.id);
	}

	async saveAdminFromSmartContract(daoAddress: string, walletAddresses: string[]) {
		const dao = await this.daoService.getByAddress(daoAddress);

		if (!dao) {
			throw new NotFoundError('Not found dao with selected contract address');
		}

		const existingUsers = await this.findManyByWalletAddresses(walletAddresses);

		const newWalletAddresses = difference(
			walletAddresses,
			existingUsers.map((item) => item.walletAddress)
		);

		const newUsers: DeepPartial<User>[] = newWalletAddresses.map((walletAddress) => ({
			walletAddress,
			nonce: DEFAULT_NONCE,
			hasBetaAccess: true
		}));

		await this.createMany(newUsers);

		const users = await this.findManyByWalletAddresses(walletAddresses);
		const userIds = users.map(({ id }) => id);
		const membersToAdd = users.map(({ id }) => ({ id }));

		if (this.isAdminEmailsEnabled()) {
			const { name, slug } = dao;

			const existingAdmins = await this.daoMembershipService.getMembersByRoles(dao.id, [
				DaoMemberRole.Admin,
				DaoMemberRole.Creator,
				DaoMemberRole.Sudo
			]);
			const newAdmins = users
				.filter((user) => !existingAdmins.some((admin) => admin.userId === user.id))
				// FIXME: remove after QA
				.filter((user) => user.isSupervisor);

			const { emails, variables } = getMailingListWithWalletAddress(newAdmins);

			this.emailService.sendAdminEmailMessage(emails, variables, { daoSlug: slug, daoName: name });
		}

		this.logger.log('[CronJob] save admins from contract', {
			type: 'save admins',
			daoAddress,
			membersToAdd,
			membersToAddCount: membersToAdd.length,
			membersToUpdate: userIds,
			membersToUpdateCount: userIds.length
		});

		await Promise.all([
			this.daoMembershipService.addManyMembers(dao.id, membersToAdd, DaoMemberRole.Admin),
			this.daoMembershipService.updateAdminList(dao.id, userIds),
			this.daoMembershipService.updateMembersCount(dao.id)
		]);
	}

	async saveMembersFromSmartContract(daoAddress: string, members: DaosMembersByNftData['daoAddress']) {
		const dao = await this.daoService.getByAddress(daoAddress);
		if (!dao) throw new NotFoundError('Not found dao with selected contract address');

		const newUsers = [];
		const walletAddresses: string[] = [];
		for (const member of members) {
			const { walletAddress } = member;

			walletAddresses.push(walletAddress);
			newUsers.push({ walletAddress: walletAddress, nonce: DEFAULT_NONCE });
		}

		await this.createMany(newUsers);

		const users = await this.findManyByWalletAddresses(walletAddresses);

		const existingUsers = await this.daoMembershipRepository.findBy({ daoId: dao.id });
		const existingUsersIds = existingUsers.map(({ userId }) => userId);

		const membersToAdd: { id: string; tiers?: string[] }[] = [];
		const membersToUpdate: { id: string; tiers?: string[] }[] = [];

		const membersByAddress = keyBy(members, 'walletAddress');

		users.forEach(({ id, walletAddress }) => {
			const currentMember = membersByAddress[walletAddress];
			if (!currentMember) return;
			const member = { id, tiers: currentMember.tiers };

			membersToUpdate.push(member);
			if (!existingUsersIds.includes(id)) membersToAdd.push(member);
		});

		this.logger.log('[CronJob] save members from contract', {
			type: 'save members',
			daoAddress,
			membersToAdd,
			membersToAddCount: membersToAdd.length,
			membersToUpdate,
			membersToUpdateCount: membersToUpdate.length
		});

		await Promise.all([
			this.daoMembershipService.addManyMembers(dao.id, membersToAdd, DaoMemberRole.Member),
			this.daoMembershipService.updateMemberList(dao.id, membersToUpdate),
			this.daoMembershipService.updateMembersCount(dao.id)
		]);
	}

	findByWalletAddress(walletAddress: string) {
		return this.userRepository
			.createQueryBuilder('user')
			.where('LOWER(user.walletAddress) = LOWER(:walletAddress)', { walletAddress })
			.leftJoinAndSelect('user.links', 'links')
			.getOne();
	}

	async findManyByWalletAddresses(walletAddresses: string[]): Promise<User[]> {
		if (!walletAddresses.length) return [];

		const users = await this.userRepository
			.createQueryBuilder('user')
			.where('LOWER(user.walletAddress) IN (:...walletAddresses)', {
				walletAddresses: walletAddresses.map(toLower)
			})
			.select('user.id', 'id')
			.addSelect('user.displayName', 'displayName')
			.addSelect('user.ens', 'ens')
			.addSelect('user.avatar', 'avatar')
			.addSelect('user.email', 'email')
			.addSelect('LOWER(user.walletAddress)', 'walletAddress')
			.addSelect('user.email', 'email')
			// FIXME: remove after QA
			.addSelect('user.isSupervisor', 'isSupervisor')
			.getRawMany();

		return users;
	}

	async findByIdOrSlug(idOrSlug: string) {
		return this.userRepository
			.createQueryBuilder('user')
			.where('LOWER("slug") = LOWER(:idOrSlug)', { idOrSlug })
			.orWhere('LOWER(CAST(user.id AS VARCHAR)) = LOWER(:idOrSlug)', { idOrSlug })
			.leftJoinAndSelect('user.onboarding', 'onboarding')
			.leftJoinAndSelect('user.links', 'links')
			.getOne();
	}

	async findBySlug(slug: string) {
		return this.userRepository.createQueryBuilder('user').where('user.slug = :slug', { slug }).getOne();
	}

	async getUserNfts(idOrSlug: string) {
		return this.userRepository
			.createQueryBuilder('user')
			.where('user.slug = :idOrSlug', { idOrSlug })
			.orWhere('CAST(user.id AS VARCHAR) = :idOrSlug', { idOrSlug })
			.leftJoinAndSelect('user.nfts', 'nfts')
			.innerJoinAndSelect('nfts.collection', 'collection')
			.innerJoinAndSelect('nfts.dao', 'dao')
			.orderBy('nfts.mintedAt', 'DESC')
			.getOne();
	}

	async createMany(users: DeepPartial<User>[]) {
		const parsedUsers = users.map((u) => ({ ...u, walletAddress: u.walletAddress?.toLowerCase() }));

		const savedUsers = await Promise.all(
			parsedUsers.map(async (parsedUser) => {
				try {
					const insertedUser = await this.userRepository.save(parsedUser);

					const links = await this.linksRepository.save({ entityId: insertedUser.id });

					await this.userRepository.update({ id: insertedUser.id }, { links });
				} catch (error) {}
			})
		);

		return savedUsers;
	}

	async updateCookieDecision(decision: boolean, user: User) {
		user.hasCookieDecision = true;
		user.agreedWithCookie = decision;

		await user.save();
	}

	async getAllUsers(request: PaginationWithSearch) {
		const { offset = 0, limit = 20, search = '' } = request;

		const queryBuilder = this.userRepository.createQueryBuilder('user');

		queryBuilder.offset(offset);
		queryBuilder.limit(limit);

		const normalizedSearch = normalizeSearchQuery(search);

		if (normalizedSearch) {
			queryBuilder.where('user.displayName ilike :nameSearch', { nameSearch: `%${normalizedSearch}%` });
			queryBuilder.orWhere('user.email ilike :emailSearch', { emailSearch: `%${normalizedSearch}%` });
		}

		queryBuilder.leftJoinAndSelect('user.links', 'links');

		queryBuilder
			.groupBy('user.id')
			.addGroupBy('user.displayName')
			.addGroupBy('user.slug')
			.addGroupBy('user.avatar')
			.addGroupBy('user.links')
			.addGroupBy('links.id');

		const count = await queryBuilder.getCount();
		const daos = await queryBuilder.getMany();

		return {
			count,
			items: daos
		};
	}

	async getCountOfExistingWallets(wallets: string[]) {
		if (!wallets.length) return 0;

		return this.userRepository
			.createQueryBuilder('user')
			.where('LOWER(user.walletAddress) IN (:...wallets)', { wallets: wallets.map(toLower) })
			.getCount();
	}

	async getUserById(id: string) {
		return this.userRepository.findOneBy({ id });
	}

	async updateEmail(userId: string, email: string) {
		await this.userRepository.update({ id: userId }, { email });
	}
}
