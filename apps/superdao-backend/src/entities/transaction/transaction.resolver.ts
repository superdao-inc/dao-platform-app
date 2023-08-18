// entities
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ValidationError } from 'apollo-server-core';
import _merge from 'lodash/merge';
import _keyBy from 'lodash/keyBy';

import express from 'express';
import { Logger, UseGuards } from '@nestjs/common';

import { WhitelistService } from 'src/entities/whitelist/whitelist.service';

// dto
import { AirdropTxInput } from 'src/entities/transaction/dto/airdropTx.dto';
import {
	AllowanceTransactionInput,
	BuyNftMulticurrencyOpenSaleTxInput,
	BuyNftOpenSaleTxInput,
	BuyNftWhitelistSaleTxInput
} from 'src/entities/transaction/dto/buyNftTx.dto';
import { TransactionService } from 'src/entities/transaction/transaction.service';
import { EnsResolver } from 'src/services/the-graph/ens/ensResolver';
import { TransactionType } from 'src/entities/transaction/transaction.types';
import { ForbiddenError, NotFoundError } from 'src/exceptions';
import { Collection } from 'src/blockchain/collection';
import { AuthGuard } from 'src/auth.guard';
import { NftClientService } from 'src/entities/nft/nft-client.service';
import { DeleteNftTierTxInput } from 'src/entities/transaction/dto/deleteNftTierTx.dto';
import { ChangeMemberRoleInput } from 'src/entities/blockchain/dto/changeRoleTx.dto';
import { DaoService } from 'src/entities/dao/dao.service';
import { UserService } from 'src/entities/user/user.service';
import { ContractService } from '../contract/contract.service';
import { BanMemberTx } from './dto/banMemberTx.dto';
import { WhitelistAddWalletsTxInput, WhitelistRemoveWalletsTxInput } from './dto/whitelistUpdateWalletsTx.dto';
import { DaoMembershipService } from '../daoMembership/daoMembership.service';
import { TransactionBrokerService } from 'src/services/messageBroker/transaction/transactionBroker.service';

@Resolver()
export class TransactionResolver {
	private readonly logger = new Logger(TransactionResolver.name);

	constructor(
		private readonly contractService: ContractService,
		private readonly daoService: DaoService,
		private readonly userService: UserService,
		private readonly transactionService: TransactionService,
		private readonly whitelistService: WhitelistService,
		private readonly nftClientService: NftClientService,
		private readonly daoMembershipService: DaoMembershipService,
		private readonly transactionBrokerService: TransactionBrokerService
	) {}

	@UseGuards(AuthGuard)
	@Query(() => TransactionType)
	async banMemberTx(@Args() banMemberData: BanMemberTx, @Context('req') context: express.Request) {
		const currentUserId = context.session?.userId;
		const user = await this.userService.getUserById(currentUserId);

		if (!user) throw new NotFoundError('User was not found');

		const { userId, daoAddress, tokenIds } = banMemberData;

		return this.transactionService.banMember(userId, daoAddress, tokenIds);
	}

	@UseGuards(AuthGuard)
	@Query(() => TransactionType)
	async whitelistRemoveWalletsTx(
		@Args() whitelistRemoveWalletDataTx: WhitelistRemoveWalletsTxInput,
		@Context('req') context: express.Request
	) {
		const { userId, daoAddress } = whitelistRemoveWalletDataTx;

		const currentUserId = context.session?.userId;
		const user = await this.userService.getUserById(currentUserId);

		if (!user) throw new NotFoundError('User was not found');
		if (!user.hasBetaAccess) throw new ValidationError('User has no access to ban member');

		const dao = await this.daoService.getByAddress(daoAddress);
		if (!dao) throw new NotFoundError();

		const whitelist = await this.whitelistService.getSaleWhitelist(dao.id);

		const formattedWhitelistForMerkleTree = whitelist.filter((participant) => participant.id !== userId);

		const merkleTree = await this.whitelistService.buildMerkleTree(formattedWhitelistForMerkleTree);
		return await this.transactionService.saveWhitelistMerkleRoot(daoAddress, merkleTree.getHexRoot());
	}

	@UseGuards(AuthGuard)
	@Query(() => TransactionType)
	async whitelistAddWalletsTx(@Args() whitelistAddTxData: WhitelistAddWalletsTxInput) {
		const { whitelist, daoAddress } = whitelistAddTxData;

		const dao = await this.daoService.getByAddress(daoAddress);
		if (!dao) throw new NotFoundError();

		const currentParticipantsWhitelist = await this.whitelistService.getSaleWhitelist(dao.id);

		const mergedWhitelists = _merge(
			_keyBy(currentParticipantsWhitelist, 'walletAddress'),
			_keyBy(whitelist, 'walletAddress')
		);

		const whitelistResolvedEns = await Promise.all(
			Object.values(mergedWhitelists).map(async (whitelistItem) => {
				const walletAddress = await EnsResolver.resolve(whitelistItem.walletAddress);

				return { ...whitelistItem, walletAddress: walletAddress!.toLowerCase() };
			})
		);

		const merkleTree = await this.whitelistService.buildMerkleTree(whitelistResolvedEns);
		return await this.transactionService.saveWhitelistMerkleRoot(daoAddress, merkleTree.getHexRoot());
	}

	@UseGuards(AuthGuard)
	@Query(() => TransactionType)
	async airdropTx(@Args() airdropData: AirdropTxInput, @Context('req') context: express.Request) {
		const userId = context.session?.userId;

		const user = await this.userService.getUserById(userId);

		if (!user) throw new NotFoundError('User was not found');

		const { daoAddress, items } = airdropData;
		const txs = await this.contractService.airdropTx(daoAddress, items);
		if (!txs) throw Error('txs length zero');

		const result = await this.contractService.batchCall(daoAddress, txs);

		return { ...result, from: undefined };
	}

	@UseGuards(AuthGuard)
	@Query(() => TransactionType)
	async createDaoTx(@Args('name', { description: 'Dao name' }) name: string, @Context('req') context: express.Request) {
		const userId = context.session?.userId;
		const user = await this.userService.getUserById(userId);

		if (!user) throw new NotFoundError('User was not found');
		if (!user.hasBetaAccess) throw new ForbiddenError('User has no access to create Dao');

		return this.transactionService.createDao(name, name, [user.walletAddress]);
	}

	@UseGuards(AuthGuard)
	@Query(() => TransactionType)
	async saveClaimWhitelistTx(@Args() whitelistData: WhitelistAddWalletsTxInput) {
		const { daoAddress, whitelist } = whitelistData;

		return Collection.saveClaimWhitelistTx(daoAddress, whitelist);
	}

	@UseGuards(AuthGuard)
	@Query(() => TransactionType)
	async buyNftOpenSaleTx(@Args() buyNftData: BuyNftOpenSaleTxInput) {
		const { daoAddress, toAddress, tier } = buyNftData;
		return this.nftClientService.buyOpenSale(daoAddress, toAddress, tier);
	}

	@UseGuards(AuthGuard)
	@Query(() => TransactionType)
	async buyNftWhitelistSaleTx(@Args() buyNftData: BuyNftWhitelistSaleTxInput) {
		const { daoAddress, toAddress, tier } = buyNftData;

		const merkleTreeProofs = await this.whitelistService.getMerkleTreeProof(daoAddress, toAddress, tier);

		if (!merkleTreeProofs) {
			return null;
		}

		const { hexProofTier, hexProofAnyTier } = merkleTreeProofs;

		const proof = hexProofAnyTier?.length ? hexProofAnyTier : hexProofTier;

		return this.transactionService.buyWhitelistSale(daoAddress, tier, proof);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => TransactionType)
	async buyNftMulticurrencyOpenSaleTx(
		@Args() buyNftData: BuyNftMulticurrencyOpenSaleTxInput,
		@Context('req') Context: express.Request
	) {
		const { walletAddr, userId } = Context.session!;
		if (!walletAddr) throw new NotFoundError('walletAddr was not found');

		const user = await this.userService.getUserById(userId);
		if (!user) throw new NotFoundError('User was not found');

		const { daoAddress, tier, tokenAddress } = buyNftData;

		return this.transactionService.buyNftMulticurrencyOpenSaleTx(walletAddr, user, daoAddress, tier, tokenAddress);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async processAllowanceTransaction(
		@Args() allowanceData: AllowanceTransactionInput,
		@Context('req') Context: express.Request
	) {
		const { tier, transactionHash, daoAddress, tokenAddress } = allowanceData;
		const userId = Context.session?.userId;

		await this.transactionBrokerService.processAllowanceTransaction({
			daoAddress,
			tier,
			transactionHash,
			tokenAddress,
			userToNotify: userId
		});

		return true;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => TransactionType)
	async buyNftAllowanceTx(
		@Args() buyNftData: BuyNftMulticurrencyOpenSaleTxInput,
		@Context('req') Context: express.Request
	) {
		const { walletAddr, userId } = Context.session!;
		if (!walletAddr) throw new NotFoundError('walletAddr was not found');

		const { daoAddress, tier, tokenAddress } = buyNftData;

		try {
			const tx = await this.contractService.getAllowanceTx(daoAddress, {
				tier,
				tokenAddress,
				userWalletAddress: walletAddr as string
			});

			this.logger.log(`[MulticurrencyOpenSale] Allowance tx:`, { tx });
			return tx;
		} catch (error) {
			this.logger.error(`[MulticurrencyOpenSale] Can't get allowance tx`, { error, daoAddress, tier, userId });

			throw error;
		}
	}

	@UseGuards(AuthGuard)
	@Query(() => TransactionType)
	async deleteNftTierTx(@Args() args: DeleteNftTierTxInput) {
		const { daoAddress, erc721CollectionAddress, tier } = args;
		return this.contractService.deleteNftTierTx(daoAddress, erc721CollectionAddress, tier);
	}

	@UseGuards(AuthGuard)
	@Query(() => TransactionType)
	async grantMemberRoleTx(@Args('changeMemberRoleData') changeMemberRoleData: ChangeMemberRoleInput) {
		const { daoAddress, userWalletAddress, role } = changeMemberRoleData;
		return this.contractService.grantMemberRoleTx(daoAddress, userWalletAddress, role);
	}

	@UseGuards(AuthGuard)
	@Query(() => TransactionType)
	async revokeMemberRoleTx(@Args('changeMemberRoleData') changeMemberRoleData: ChangeMemberRoleInput) {
		const { daoAddress, userWalletAddress } = changeMemberRoleData;

		const dao = await this.daoService.getByAddress(daoAddress);
		if (!dao) throw new NotFoundError();

		const member = await this.userService.findByWalletAddress(userWalletAddress);
		if (!member) throw new NotFoundError();

		const currentMemberRole = await this.daoMembershipService.getMemberById({ daoId: dao.id, memberId: member.id });
		if (!currentMemberRole) throw new NotFoundError();

		return this.contractService.revokeMemberRoleTx(daoAddress, userWalletAddress, currentMemberRole.role);
	}
}
