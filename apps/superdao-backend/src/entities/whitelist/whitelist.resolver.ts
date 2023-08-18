import { Args, Context, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import express from 'express';
import { UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dao } from '../dao/dao.model';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import { Whitelist } from './whitelist.model';
import { WhitelistAddWalletInput, WhitelistData, WhitelistParticipantsRequest } from './whitelist.types';
import { WhitelistRemoveWalletInput } from './dto/whitelistRemoveWallet.dto';
import { WhitelistService } from './whitelist.service';
import PaginatedResponse from 'src/gql/pagination';
import { NotFoundError } from 'src/exceptions';
import { WhitelistAddMessage, WhitelistRemoveMessage } from 'src/entities/blockchain/types';
import { AuthGuard } from 'src/auth.guard';
import { DaoService } from 'src/entities/dao/dao.service';
import { UpdateWhitelistStatusInput } from './dto/updateWhitelistStatus.dto';
import { TransactionBrokerService } from 'src/services/messageBroker/transaction/transactionBroker.service';

@ObjectType()
class WhitelistParticipants extends PaginatedResponse(Whitelist) {}

@Resolver(() => Whitelist)
export class WhitelistResolver {
	constructor(
		@InjectRepository(Dao) private readonly daoRepository: Repository<Dao>,
		private readonly whitelistService: WhitelistService,
		private readonly daoService: DaoService,
		private readonly daoMembershipService: DaoMembershipService,
		private readonly transactionBrokerService: TransactionBrokerService
	) {}

	@UseGuards(AuthGuard)
	@Query(() => WhitelistParticipants)
	async getDaoWhitelist(@Args() whitelistParticipantsRequest: WhitelistParticipantsRequest) {
		const query = await this.whitelistService.createGetWhitelistParticipantQuery(whitelistParticipantsRequest);
		const [items, count] = await query.getManyAndCount();

		return {
			count,
			items
		};
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async whitelistRemoveWallet(
		@Args('whitelistRemoveWalletData') whitelistRemoveWalletData: WhitelistRemoveWalletInput,
		@Context('req') ctx: express.Request
	) {
		const { userId, transactionHash, daoAddress } = whitelistRemoveWalletData;
		const currentUserId = ctx?.session?.userId;

		const dao = await this.daoService.getByAddress(daoAddress);
		if (!dao) throw new NotFoundError();

		await this.daoMembershipService.checkAccess(currentUserId, dao.id, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);
		const participant = await this.whitelistService.findById(userId);

		if (!participant) throw new NotFoundError();

		const msgData: WhitelistRemoveMessage['data'] = {
			transactionHash,
			userToNotify: currentUserId,
			daoId: dao.id,
			userToBan: {
				walletAddress: participant.walletAddress,
				id: userId,
				displayName: participant.walletAddress
			}
		};

		this.transactionBrokerService.trackWhitelistRemoveTransaction(msgData);

		return true;
	}

	//Вайтлист по walletAddress
	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async whitelistAddWallet(
		@Args('whitelistAddWalletData') whitelistAddWalletData: WhitelistAddWalletInput,
		@Context('req') ctx: express.Request
	): Promise<boolean> {
		const { daoAddress, items, transactionHash } = whitelistAddWalletData;
		const userId = ctx.session?.userId;

		const dao = await this.daoRepository.findOneBy({ contractAddress: daoAddress });
		if (!dao) throw new NotFoundError();

		await this.daoMembershipService.checkAccess(userId, dao.id, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);

		const msgData: WhitelistAddMessage['data'] = {
			transactionHash,
			userToNotify: userId,
			daoId: dao.id,
			daoSlug: dao.slug,
			daoAddress,
			whitelist: items
		};

		this.transactionBrokerService.trackWhitelistAddTransaction(msgData);

		return true;
	}

	@UseGuards(AuthGuard)
	@Query(() => Boolean)
	getVerify(@Args('daoAddress') daoAddress: string, @Args('tier') tier: string, @Context('req') ctx: express.Request) {
		return this.whitelistService.getVerifyWhitelistAddress(daoAddress, ctx.session?.walletAddr, tier);
	}

	@UseGuards(AuthGuard)
	@Query(() => [Whitelist])
	daoWhitelistSale(@Args('daoId') daoId: string) {
		return this.whitelistService.getSaleWhitelist(daoId);
	}

	//Вайтлист по емейлу, он же email-link
	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async whitelistAddEmail(
		@Args('whitelistAddEmailData') whitelistAddEmailData: WhitelistData,
		@Context('req') ctx: express.Request
	): Promise<boolean> {
		const { daoId, items } = whitelistAddEmailData;
		const userId = ctx.session?.userId;

		await this.daoMembershipService.checkAccess(userId, daoId, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);

		await this.whitelistService.updateWhitelistEmailClaimParticipants(items, daoId);

		return true;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async updateWhitelistStatus(
		@Args('updateWhitelistStatusData') updateWhitelistStatusData: UpdateWhitelistStatusInput
	) {
		const { id, status } = updateWhitelistStatusData;

		await this.whitelistService.updateRecord(id, { status });

		return true;
	}

	@Query(() => Whitelist)
	async getWhitelistRecord(@Args('id') id: string) {
		const record = await this.whitelistService.getRecordById(id);

		return record;
	}
}
