import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Not, Repository, In } from 'typeorm';

import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ForbiddenError, NotFoundError } from 'src/exceptions';
import { EnsResolver } from 'src/services/the-graph/ens/ensResolver';
import { Dao } from 'src/entities/dao/dao.model';
import { UserService } from 'src/entities/user/user.service';
import { SocketService } from 'src/services/socket/socket.service';
import { GNOSIS_ADMIN_ADDRESS } from 'src/constants';
import { normalizeSearchQuery } from 'src/utils/normalizeSearchQuery';
import { User } from '../user/user.model';
import {
	CheckAccessParams,
	DaoMemberRequest,
	DaoMemberRole,
	DaoMembersExportRequest,
	DaoMembersRequest,
	UpdateMember
} from './daoMembership.types';
import { DaoMembership } from './daoMembership.model';
import { toPublicMemberRoles } from './daoMembership.generator';
import { isENS, MessageName } from '@sd/superdao-shared';
import { MessageData } from '../blockchain/types';
import { DaoService } from '../dao/dao.service';

type GetMembersResponse = Promise<{ count: number; items: DaoMembership[] }>;

@Injectable()
export class DaoMembershipService {
	private readonly logger = new Logger(DaoMembershipService.name);

	constructor(
		@InjectDataSource() private dataSource: DataSource,
		@InjectRepository(User) private userRepository: Repository<User>,
		@InjectRepository(Dao) private daoRepository: Repository<Dao>,
		@InjectRepository(DaoMembership) private daoMembershipRepository: Repository<DaoMembership>,
		@Inject(forwardRef(() => UserService)) private userService: UserService,
		private readonly socketService: SocketService,
		@Inject(forwardRef(() => DaoService)) private daoService: DaoService
	) {}

	async checkAccess(userId: string, daoId: string, allowedRoles: DaoMemberRole[]) {
		const membership = await this.checkAccessLevel({
			daoId,
			userId,
			allowedRoles
		});

		const user = await this.userRepository.findOneBy({ id: userId });

		if (!membership && !user?.isSupervisor) {
			throw new ForbiddenError('');
		}
	}

	async updateCreatorOrSudo(daoAddress: string, walletAddress: string, role: DaoMemberRole) {
		const dao = await this.daoService.getByAddress(daoAddress);
		if (!dao) throw new NotFoundError();

		const address = role === DaoMemberRole.Creator ? walletAddress : GNOSIS_ADMIN_ADDRESS.toLowerCase();
		const user = await this.userService.findByWalletAddress(address);
		if (!user) throw new NotFoundError();

		const memberExists = await this.daoMembershipRepository
			.createQueryBuilder('membership')
			.where('membership.daoId = :daoId', { daoId: dao.id })
			.andWhere('membership."userId" = :userId', { userId: user.id })
			.getOne();

		// If there is no creator as a member, add to the table (this scenario is almost unrealistic)
		// Otherwise, we make the Creator role (and such a scenario is real for sudo)
		if (!memberExists) {
			await this.dataSource.transaction(async (manager) => {
				await manager.create<DaoMembership>(DaoMembership, { daoId: dao.id, userId: user.id, role: role }).save();
			});
		} else {
			await this.changeRole(dao.id, user.id, role);
		}
	}

	async changeMemberRoleSuccess(data: MessageData['CHANGE_MEMBER_ROLE']) {
		const { daoId, userId, role, userToNotify, daoSlug } = data;

		await this.changeRole(daoId, userId, role);

		this.socketService.sendPrivateMessage(userToNotify, MessageName.CHANGE_MEMBER_ROLE_SUCCESS, {
			daoId,
			userId,
			daoSlug
		});
	}

	async changeMemberRoleFail(data: MessageData['CHANGE_MEMBER_ROLE']) {
		const { daoId, userId, userToNotify } = data;

		this.socketService.sendPrivateMessage(userToNotify, MessageName.CHANGE_MEMBER_ROLE_FAILED, {
			daoId,
			userId
		});
	}

	async checkAccessLevel(params: CheckAccessParams) {
		try {
			const membership = await this.daoMembershipRepository.findOneOrFail({
				where: { daoId: params.daoId, userId: params.userId }
			});

			return params.allowedRoles.includes(membership.role);
		} catch (e) {
			return false;
		}
	}

	async getMemberById(request: DaoMemberRequest) {
		const { daoId, memberId } = request;

		try {
			return await this.daoMembershipRepository.findOne({
				where: { daoId, userId: memberId },
				join: { alias: 'membership', leftJoinAndSelect: { user: 'membership.user' } }
			});
		} catch (e) {
			return undefined;
		}
	}

	async createGetMembersQuery(request: DaoMembersRequest, customOrders?: string[]) {
		const { daoId, roles, offset = 0, limit = 20, search = '' } = request;

		const query = this.daoMembershipRepository.createQueryBuilder('membership');

		query.where('membership.daoId = :daoId', { daoId });
		query.andWhere('membership.role != :sudoRole', { sudoRole: DaoMemberRole.Sudo }); //Sudo юзера не возвращаем

		if (roles) {
			query.andWhere('membership.role IN(:...roles)', { roles });
		}

		if (customOrders?.length) {
			customOrders.forEach((order) => {
				query.addOrderBy(order);
			});
		}

		query.leftJoinAndSelect('membership.user', 'user');
		query.addOrderBy('user.isClaimed', 'DESC');

		query.addOrderBy(
			`(case "role"
						when '${DaoMemberRole.Creator}' then 1
						when '${DaoMemberRole.Admin}' then 2
						when '${DaoMemberRole.Member}' then 3
				 else null end)`
		);
		query.addOrderBy('membership.createdAt');
		query.offset(offset);
		query.limit(limit);

		let normalizedSearch = normalizeSearchQuery(search);

		if (normalizedSearch) {
			if (isENS(normalizedSearch)) {
				normalizedSearch = normalizeSearchQuery((await EnsResolver.resolve(normalizedSearch)) || '');
			}

			query.andWhere(
				new Brackets((qb) => {
					qb.where('user.displayName ilike :searchQuery', { searchQuery: `%${normalizedSearch}%` })
						.orWhere('user.walletAddress ilike :searchQuery', { searchQuery: `%${normalizedSearch}%` })
						.orWhere('user.ens ilike :searchQuery', { searchQuery: `%${normalizedSearch}%` });
				})
			);
		}

		return query;
	}

	async getMembers(request: DaoMembersRequest, currentUser?: User | null): GetMembersResponse {
		const { daoId } = request;

		const customOrders: string[] = [];
		if (currentUser) {
			const currentUserMembership = await this.getMemberById({ daoId, memberId: currentUser.id });

			if (currentUserMembership) {
				customOrders.push(`(case when membership.userId = '${currentUser.id}' then 1 else 2 end)`);
			}
		}

		const query = await this.createGetMembersQuery(request, customOrders);
		const [items, count] = await query.getManyAndCount();

		return {
			count,
			items
		};
	}

	async getAllMembers(daoId: string) {
		const query = await this.daoMembershipRepository.createQueryBuilder('membership');

		query.where('membership.daoId = :daoId', { daoId });
		query.leftJoinAndSelect('membership.user', 'user');

		const participations = await query.getMany();

		return participations.map((part) => part.user);
	}

	async getMembersForExport(request: DaoMembersExportRequest) {
		const { daoId } = request;
		const query = await this.daoMembershipRepository.createQueryBuilder('membership');

		query.where('membership.daoId = :daoId', { daoId });
		query.leftJoinAndSelect('membership.user', 'user');

		const [items, count] = await query.getManyAndCount();

		return {
			count,
			items
		};
	}

	async getAllMemberships(daoId: string) {
		return await this.daoMembershipRepository
			.createQueryBuilder('membership')
			.where('membership.daoId = :daoId', { daoId })
			.leftJoinAndSelect('membership.user', 'user')
			.getMany();
	}

	async changeRole(daoId: string, userId: string, role: DaoMemberRole) {
		await this.daoMembershipRepository.update({ userId, daoId }, { role });
	}

	async updateMemberTiersOrInsert(member: Partial<DaoMembership>) {
		if (!member || !member.tiers?.length) return;

		const existMember = await this.daoMembershipRepository.findOneBy({ userId: member.userId, daoId: member.daoId });

		const updateTiers = existMember ? [...existMember?.tiers, ...member.tiers] : [...member.tiers];

		await this.dataSource.transaction(async (manager) => {
			await manager.upsert<DaoMembership>(DaoMembership, { ...member, tiers: updateTiers }, ['daoId', 'userId']);
			await this.updateMembersCount(member.daoId);
		});
	}

	async addManyMembers(daoId: string, users: UpdateMember[], role: DaoMemberRole) {
		if (!users.length) return;

		const userIds = users.map(({ id }) => id);
		const members = await this.daoMembershipRepository
			.createQueryBuilder('membership')
			.where('membership.daoId = :daoId', { daoId })
			.andWhere('membership.userId IN (:...userIds)', { userIds })
			.getMany();

		const membersToCreate = users
			.map(({ id: userId, tiers }) => ({ daoId, userId, role, tiers }))
			.filter(({ userId }) => {
				const m = members.find(({ userId: memberUserId }) => memberUserId === userId);
				return !m;
			});

		await this.dataSource.transaction(async (manager) => {
			await manager.upsert<DaoMembership>(DaoMembership, membersToCreate, ['id']);
		});
	}

	async updateAdminList(daoId: string, userIds: string[]) {
		if (!userIds.length) return;

		await this.dataSource.transaction(async (manager) => {
			await manager
				.createQueryBuilder()
				.update(DaoMembership)
				.where('dao_membership."daoId" = :daoId', { daoId })
				.andWhere('dao_membership."role" = :role', { role: DaoMemberRole.Member })
				.andWhere('dao_membership."userId" IN (:...userIds)', { userIds })
				.set({ role: DaoMemberRole.Admin })
				.execute();

			await manager
				.createQueryBuilder()
				.update(DaoMembership)
				.where('dao_membership."daoId" = :daoId', { daoId })
				.andWhere('dao_membership."role" = :role', { role: DaoMemberRole.Admin })
				.andWhere('dao_membership."userId" NOT IN (:...userIds)', { userIds })
				.set({ role: DaoMemberRole.Member })
				.execute();
		});
	}

	//Это отрефакторится при рефакторинге кронджоб
	async updateMemberList(daoId: string, members: UpdateMember[]) {
		const userIds = members.map(({ id }) => id);

		let allMembership = await this.daoMembershipRepository
			.createQueryBuilder('membership')
			.where('membership.daoId = :daoId', { daoId })
			.andWhere('membership.role != :sudo', { sudo: DaoMemberRole.Sudo })
			.getMany();

		const membersIdsMap = new Map(members.map((member) => [member.id, member]));

		const updatedMembership = allMembership.map((member) => ({
			...member,
			//если их нет в membersIdsMap, значит тиров просто нет НО в случае если роль была админ, мы не удаляем
			tiers: membersIdsMap.get(member.userId)?.tiers || [],
			daoId
		}));

		const queryBuilder = this.daoMembershipRepository.createQueryBuilder('membership');
		queryBuilder.where('membership.daoId = :daoId', { daoId });
		queryBuilder.andWhere('membership.role = :role', { role: DaoMemberRole.Member });

		if (userIds.length > 0) {
			queryBuilder.andWhere('membership.userId NOT IN (:...userIds)', { userIds });
		}

		const listMemberToDelete = await queryBuilder.getMany();

		await this.dataSource.transaction(async (manager) => {
			if (updatedMembership.length > 0) {
				await manager.upsert<DaoMembership>(DaoMembership, updatedMembership, ['id']);
			}

			if (listMemberToDelete.length > 0) {
				await manager.remove<DaoMembership>(DaoMembership, listMemberToDelete);
			}
		});
	}

	//функция для merge тиров после аирдропа.
	async memberUpdateTiers(daoId: string, members: UpdateMember[]) {
		if (!members.length) return;

		const userIds = members.map(({ id }) => id);
		const membersIdsMap = new Map(members.map((user) => [user.id, user]));

		const allMembership = await this.daoMembershipRepository
			.createQueryBuilder('membership')
			.where('membership.daoId = :daoId', { daoId })
			.andWhere('membership.role != :sudo', { sudo: DaoMemberRole.Sudo })
			.andWhere('membership.userId IN (:...userIds)', { userIds })
			.getMany();

		const updatedMembership = allMembership.map((member) => {
			const newTiers = membersIdsMap.get(member.userId)?.tiers || [];
			return {
				...member,
				tiers: [...member.tiers, ...newTiers],
				daoId
			};
		});

		await this.dataSource.transaction(async (manager) => {
			await manager.upsert<DaoMembership>(DaoMembership, updatedMembership, ['id']);
		});
	}

	async updateMembersCount(daoId?: string) {
		if (!daoId) return;

		const membersCount = await this.daoMembershipRepository.count({ where: { daoId, role: Not(DaoMemberRole.Sudo) } });

		return this.daoRepository.update({ id: daoId }, { membersCount });
	}

	async addMember(daoId: string, userId: string, role: DaoMemberRole, tier?: string) {
		const membership = await this.findUserInDao(daoId, userId);
		if (membership.length !== 0) return;

		try {
			return await this.dataSource.transaction(async (manager) => {
				const member = await manager
					.create<DaoMembership>(DaoMembership, { daoId, userId, role, tiers: tier ? [tier] : [] })
					.save();

				await manager
					.createQueryBuilder()
					.update(Dao)
					.whereInIds(daoId)
					.set({ membersCount: () => '"membersCount" + 1' })
					.execute();

				return member;
			});
		} catch (e: any) {
			this.logger.error('Error while adding member to dao', { daoId, userId, role, tier, e });
			throw new Error('Create membership transaction failed');
		}
	}

	async deleteMember(daoId: string, userId: string) {
		const membership = await this.findUserInDao(daoId, userId);
		if (!membership) throw new NotFoundError('Membership not found');

		try {
			await this.dataSource.transaction(async (manager) => {
				await manager.remove<DaoMembership>(DaoMembership, membership);

				await manager
					.createQueryBuilder()
					.update(Dao)
					.whereInIds(daoId)
					.set({ membersCount: () => '"membersCount" - 1' })
					.execute();
			});
		} catch (e: any) {
			throw new Error(e);
		}
	}

	async getParticipations(userId: string) {
		const query = this.daoMembershipRepository.createQueryBuilder('daoMembership');

		query.orderBy('daoMembership.createdAt', 'DESC').leftJoin('daoMembership.dao', 'dao');

		query
			.select('dao.id', 'id')
			.addSelect('slug')
			.addSelect('name')
			.addSelect('avatar')
			.addSelect('role')
			.addSelect('description')
			.addSelect('"membersCount"')
			.addSelect('"contractAddress"');

		query
			.groupBy('dao.id')
			.addGroupBy('slug')
			.addGroupBy('name')
			.addGroupBy('avatar')
			.addGroupBy('role')
			.addGroupBy('daoMembership.createdAt');

		query.where('"daoMembership"."userId" = :userId', { userId });

		const data = await query.getRawMany();

		return {
			count: await query.getCount(),
			items: data
		};
	}

	async findUserInDao(daoId: string, userId: string) {
		return this.daoMembershipRepository.find({ where: { daoId, userId } });
	}

	async memberRoles(daoId: string) {
		const roles = await this.daoMembershipRepository
			.createQueryBuilder('membership')
			.where('membership.daoId = :daoId', { daoId })
			.select('membership.role', 'role')
			.addSelect('count(*)')
			.groupBy('role')
			.getRawMany();

		return toPublicMemberRoles(roles);
	}

	async getMembersByRoles(daoId: string, roles: DaoMemberRole[]) {
		return this.daoMembershipRepository.find({ where: { daoId, role: In(roles) } });
	}

	hasAdminRights(daoMembershipRole: DaoMemberRole) {
		return [DaoMemberRole.Creator, DaoMemberRole.Admin, DaoMemberRole.Member].includes(daoMembershipRole);
	}
}
