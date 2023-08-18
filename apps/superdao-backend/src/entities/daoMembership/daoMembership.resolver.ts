import { Args, Context, ID, Mutation, ObjectType, Query, ResolveField, Resolver, Root } from '@nestjs/graphql';
import express from 'express';
import { UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundError } from 'src/exceptions';
import { Dao } from 'src/entities/dao/dao.model';
import { User } from 'src/entities/user/user.model';
import { UserService } from 'src/entities/user/user.service';
import { BanMessage, ChangeMemberRoleMessage } from 'src/entities/blockchain/types';
import PaginatedResponse from 'src/gql/pagination';
import { BanMemberInput } from 'src/entities/daoMembership/dto/banMember.dto';
import { AuthGuard } from 'src/auth.guard';
import { ChangeMembeRoleInput } from './dto/changeRole.dto';
import { DaoMembershipService } from './daoMembership.service';
import { DaoMembership } from './daoMembership.model';
import { DaoMemberRole, DaoMembersRequest, ExportMembersRequest, MemberRoleRequest } from './daoMembership.types';
import { DaoService } from '../dao/dao.service';
import { TransactionBrokerService } from 'src/services/messageBroker/transaction/transactionBroker.service';
import { TransactionsLoggingService } from '../logging/logging.service';

@ObjectType()
export class DaoMembersResponse extends PaginatedResponse(DaoMembership) {}

@Resolver(() => DaoMembership)
export class DaoMembershipResolver {
	constructor(
		@InjectRepository(Dao) private readonly daoRepository: Repository<Dao>,
		@InjectRepository(DaoMembership) private readonly daoMembershipRepository: Repository<DaoMembership>,
		private readonly daoMembershipService: DaoMembershipService,
		private readonly userService: UserService,
		private readonly daoService: DaoService,
		private readonly transactionBrokerService: TransactionBrokerService,
		private readonly transactionsLoggingService: TransactionsLoggingService
	) {}

	@UseGuards(AuthGuard)
	@Query(() => DaoMemberRole)
	async memberRoleById(@Args() memberRoleRequest: MemberRoleRequest) {
		const member = await this.daoMembershipService.getMemberById(memberRoleRequest);
		if (!member) throw new NotFoundError();

		return member.role;
	}

	@Query(() => DaoMemberRole)
	async currentUserMemberRole(@Args('daoId', { type: () => ID }) daoId: string, @Context('req') ctx: express.Request) {
		if (!ctx.session?.userId) return undefined;

		const member = await this.daoMembershipService.getMemberById({ daoId, memberId: ctx.session?.userId });

		return member?.role;
	}

	@Query(() => DaoMembersResponse)
	async daoMembers(@Args() daoMembersRequest: DaoMembersRequest, @Context('req') ctx: express.Request) {
		const currentUser = await this.userService.findByIdOrSlug(ctx.session?.userId);

		return this.daoMembershipService.getMembers(daoMembersRequest, currentUser);
	}

	@UseGuards(AuthGuard)
	@Query(() => DaoMembersResponse)
	exportMembers(@Args() exportMembersRequest: ExportMembersRequest) {
		return this.daoMembershipService.getMembersForExport(exportMembersRequest);
	}

	@UseGuards(AuthGuard)
	@Query(() => DaoMembership, { nullable: true })
	userAsMember(@Args('daoId') daoId: string, @Args('userId') userId: string) {
		return this.daoMembershipRepository.findOneBy({ daoId, userId });
	}

	@UseGuards(AuthGuard)
	@ResolveField(() => Boolean)
	canEdit(@Root() membership: DaoMembership) {
		return membership.role !== DaoMemberRole.Member;
	}

	@UseGuards(AuthGuard)
	@ResolveField(() => Dao)
	dao(@Root() membership: DaoMembership) {
		return this.daoRepository.findOneBy({ id: membership.daoId });
	}

	@UseGuards(AuthGuard)
	@ResolveField(() => User)
	user(@Root() membership: DaoMembership) {
		return this.userService.getUserById(membership.userId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async banMember(@Args('banMemberData') banMemberData: BanMemberInput, @Context('req') ctx: express.Request) {
		const { userId, transactionHash, daoAddress, shouldBurn, isGasless } = banMemberData;
		const currentUserId = ctx.session?.userId;

		const dao = await this.daoRepository.findOneBy({ contractAddress: daoAddress });
		if (!dao) throw new NotFoundError();

		await this.daoMembershipService.checkAccess(currentUserId, dao.id, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);

		const userToBan = await this.userService.findByIdOrSlug(userId);
		if (!userToBan) throw new NotFoundError();

		const msgData: BanMessage['data'] = {
			transactionHash,
			userToNotify: currentUserId,
			daoId: dao.id,
			userToBan: { id: userToBan.id, walletAddress: userToBan.walletAddress, displayName: userToBan.displayName },
			isGasless
		};

		this.transactionBrokerService.trackBanTransaction(msgData, shouldBurn);

		// if we have ban, we have and contract
		await this.transactionsLoggingService.logBanTransaction({
			executorId: currentUserId,
			transactionHash,
			bannedAddress: userId,
			daoAddress: dao.contractAddress ?? '',
			isBurnCase: shouldBurn
		});

		return true;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async grantMemberRole(
		@Args('grantMemberRoleData') grantMemberRoleData: ChangeMembeRoleInput,
		@Context('req') ctx: express.Request
	) {
		const { daoAddress, userWalletAddress, transactionHash, role } = grantMemberRoleData;

		const currsentUserId = ctx.session?.userId;

		const dao = await this.daoService.getByAddress(daoAddress);
		if (!dao) throw new NotFoundError();

		const user = await this.userService.findByWalletAddress(userWalletAddress);
		if (!user) throw new NotFoundError();

		const msgData: ChangeMemberRoleMessage['data'] = {
			transactionHash,
			userToNotify: currsentUserId,
			userId: user.id,
			daoId: dao.id,
			role,
			daoSlug: dao.slug
		};

		this.transactionBrokerService.trackChangeMemberRoleTransaction(msgData);

		return true;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async revokeMemberRole(
		@Args('revokeMemberRoleData') revokeMemberRoleData: ChangeMembeRoleInput,
		@Context('req') ctx: express.Request
	) {
		const { daoAddress, userWalletAddress, transactionHash, role } = revokeMemberRoleData;

		const currsentUserId = ctx.session?.userId;

		const dao = await this.daoService.getByAddress(daoAddress);
		if (!dao) throw new NotFoundError();

		const user = await this.userService.findByWalletAddress(userWalletAddress);
		if (!user) throw new NotFoundError();

		const msgData: ChangeMemberRoleMessage['data'] = {
			transactionHash,
			userToNotify: currsentUserId,
			userId: user.id,
			daoId: dao.id,
			daoSlug: dao.slug,
			role
		};

		this.transactionBrokerService.trackChangeMemberRoleTransaction(msgData);

		return true;
	}

	@UseGuards(AuthGuard)
	@Query(() => Boolean)
	async checkCreatorExists(@Args('daoId') daoId: string) {
		const creatorList = await this.daoMembershipService.getMembersByRoles(daoId, [DaoMemberRole.Creator]);

		return !!creatorList.length;
	}
}
