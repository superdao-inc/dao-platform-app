import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import express from 'express';
import { Logger, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserService } from 'src/entities/user/user.service';
import { NftService } from 'src/entities/nft/nft.service';
import { Dao } from 'src/entities/dao/dao.model';

import { NotFoundError } from 'src/exceptions';
import {
	AirdropMessage,
	BuyNftMessage,
	BuyWhitelistNftMessage,
	WhitelistClaimMessage
} from 'src/entities/blockchain/types';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import {
	CheckNftAvailabilityResponse,
	CalculatedFee,
	Collection,
	CollectionArtworks,
	CollectionTierInfo,
	EnrichedNft,
	EnrichedNftWithCollectionAddress,
	GetMintedNftResponse
} from 'src/entities/nft/nft.types';
import { AirdropInput } from 'src/entities/nft/dto/airdrop.dto';
import { BuyNftOpenSaleInput, BuyNftWhitelistSaleInput } from 'src/entities/nft/dto/buyNft.dto';
import { WhitelistAddWalletInput } from 'src/entities/whitelist/whitelist.types';
import { feeService } from 'src/services/feeService';

import { AuthGuard } from 'src/auth.guard';
import { CollectionsService } from 'src/entities/collections/collections.service';
import { TransactionBrokerService } from 'src/services/messageBroker/transaction/transactionBroker.service';
import { CompositeBlockchainService } from 'src/services/blockchain/blockchain.service';
import { TransactionsLoggingService } from '../logging/logging.service';
import { ContractService } from '../contract/contract.service';

@Resolver()
export class NftResolver {
	private readonly logger = new Logger(NftResolver.name);

	constructor(
		@InjectRepository(Dao) private readonly daoRepository: Repository<Dao>,
		private readonly collectionsService: CollectionsService,
		private readonly nftService: NftService,
		private readonly contractService: ContractService,
		private readonly daoMembershipService: DaoMembershipService,
		private readonly userService: UserService,
		private readonly transactionBrokerService: TransactionBrokerService,
		private readonly transactionsLoggingService: TransactionsLoggingService,
		private readonly compositeBlockchainService: CompositeBlockchainService
	) {}

	@Query(() => [EnrichedNft])
	userNfts(@Args('userId') userId: string) {
		return this.nftService.getUserNfts(userId);
	}

	@UseGuards(AuthGuard)
	@Query(() => [EnrichedNftWithCollectionAddress])
	userNftsByDao(@Args('userId') userId: string, @Args('daoAddress') daoAddress: string) {
		return this.nftService.getUserNftsByDao(userId, daoAddress);
	}

	@Query(() => EnrichedNftWithCollectionAddress)
	singleNft(@Args('tokenId') tokenId: string, @Args('daoAddress') daoAddress: string) {
		return this.nftService.getEnrichedNftByTokenId(tokenId, daoAddress);
	}

	@Query(() => Collection)
	async collection(@Args('daoAddress') daoAddress: string, @Context('req') ctx: express.Request) {
		const userId = ctx.session?.userId;
		const user = (await this.userService.getUserById(userId)) || undefined;
		return this.collectionsService.getCollection(daoAddress, user);
	}

	@Query(() => Collection)
	async collectionNFTs(@Args('daoAddress') daoAddress: string) {
		return this.collectionsService.getCollectionNFTs(daoAddress);
	}

	@UseGuards(AuthGuard)
	@Query(() => CalculatedFee)
	async fee() {
		return await feeService.getGas();
	}

	@Query(() => CollectionTierInfo)
	async collectionInfoByTier(
		@Args('daoAddress') daoAddress: string,
		@Args('tier') tier: string,
		@Context('req') ctx: express.Request
	) {
		const userId = ctx.session?.userId;
		const user = (await this.userService.getUserById(userId)) || undefined;

		return this.nftService.getCollectionInfoByTier(daoAddress, tier, user);
	}

	@Query(() => CollectionArtworks)
	async collectionArtworks(@Args('daoAddress') daoAddress: string, @Args('tier') tier: string) {
		return this.compositeBlockchainService.getCollectionArtworks(daoAddress, tier);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async airdrop(
		@Args('airdropData') airdropData: AirdropInput,
		@Context('req') ctx: express.Request
	): Promise<boolean> {
		const { transactionHash, daoAddress, items, isGasless } = airdropData;
		const userId = ctx.session?.userId;

		const dao = await this.daoRepository.findOneBy({ contractAddress: daoAddress });
		if (!dao) throw new NotFoundError();

		await this.daoMembershipService.checkAccess(userId, dao.id, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);

		const msgData: AirdropMessage['data'] = {
			transactionHash,
			userToNotify: userId,
			daoSlug: dao.slug,
			daoId: dao.id,
			daoAddress,
			items,
			isGasless
		};

		this.transactionBrokerService.trackAirdropTransaction(msgData);

		await this.transactionsLoggingService.logAirdropTransaction({
			executorId: userId,
			transactionHash,
			daoAddress: dao.contractAddress ?? '',
			participants: items
		});

		return true;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async saveClaimWhitelist(
		@Args('whitelist') whitelistData: WhitelistAddWalletInput,
		@Context('req') ctx: express.Request
	): Promise<boolean> {
		const { daoAddress, items, transactionHash } = whitelistData;
		const userId = ctx.session?.userId;

		const dao = await this.daoRepository.findOneBy({ contractAddress: daoAddress });
		if (!dao) throw new NotFoundError();

		await this.daoMembershipService.checkAccess(userId, dao.id, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);

		const msgData: WhitelistClaimMessage['data'] = {
			transactionHash,
			userToNotify: userId,
			daoId: dao.id,
			daoSlug: dao.slug,
			daoAddress,
			whitelist: items
		};

		this.transactionBrokerService.trackWhitelistClaimTransaction(msgData);

		await this.transactionsLoggingService.logWhitelistTransaction({
			executorId: userId,
			transactionHash,
			daoAddress: dao.contractAddress ?? '',
			participants: items
		});

		return true;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async buyNftOpenSale(@Args('buyNftData') buyNftData: BuyNftOpenSaleInput, @Context('req') ctx: express.Request) {
		const { email, daoAddress, tier, transactionHash } = buyNftData;
		const userId = ctx.session?.userId;

		const dao = await this.daoRepository.findOneBy({ contractAddress: daoAddress });
		if (!dao) throw new NotFoundError();

		const { id: daoId } = dao;

		const msgData: BuyNftMessage['data'] = {
			email,
			transactionHash,
			userToNotify: userId,
			daoId,
			daoAddress,
			tier
		};

		this.transactionBrokerService.trackBuyNftTransaction(msgData);

		await this.transactionsLoggingService.logBuyNftTransaction({
			executorId: userId,
			transactionHash,
			daoAddress: dao.contractAddress ?? '',
			tier,
			isWhitelist: false
		});

		return true;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async buyNftWhitelistSale(
		@Args('buyNftData') buyNftData: BuyNftWhitelistSaleInput,
		@Context('req') ctx: express.Request
	) {
		const { email, daoAddress, tier, transactionHash } = buyNftData;
		const userId = ctx.session?.userId;

		const dao = await this.daoRepository.findOneBy({ contractAddress: daoAddress });
		if (!dao) throw new NotFoundError();

		const { id: daoId } = dao;

		const msgData: BuyWhitelistNftMessage['data'] = {
			email,
			transactionHash,
			userToNotify: userId,
			daoId,
			daoAddress,
			tier
		};

		this.transactionBrokerService.trackBuyWhitelistNftTransaction(msgData);

		await this.transactionsLoggingService.logBuyNftTransaction({
			executorId: userId,
			transactionHash,
			daoAddress: dao.contractAddress ?? '',
			tier,
			isWhitelist: true
		});

		return true;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async claimNft(
		@Args('tier') tier: string,
		@Args('daoAddress') daoAddress: string,
		@Context('req') ctx: express.Request
	) {
		const { userId } = ctx.session!;

		return this.nftService.claimNft(userId, daoAddress, tier);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async claimNftByEmail(@Args('uid') uid: string, @Context('req') ctx: express.Request) {
		const { userId } = ctx.session!;

		return this.nftService.claimNftByEmail(userId, uid);
	}

	@UseGuards(AuthGuard)
	@Query(() => Boolean)
	getVerifyWhitelistClaim(
		@Args('daoAddress') daoAddress: string,
		@Args('tier') tier: string,
		@Context('req') ctx: express.Request
	) {
		const { userId } = ctx.session!;

		return this.nftService.getVerifyClaimWhitelist(daoAddress, userId, tier);
	}

	@UseGuards(AuthGuard)
	@Query(() => CheckNftAvailabilityResponse)
	async checkNftAvailability(
		@Args('daoAddress') daoAddress: string,
		@Args('tier') tier: string,
		@Context('req') ctx: express.Request
	) {
		const userId = ctx.session?.userId;
		const currentUser = await this.userService.getUserById(userId);
		if (!currentUser) throw new NotFoundError('User not found');
		if (!ctx.session?.walletAddr) throw new NotFoundError('User wallet address is missing');

		let availableCount;
		try {
			availableCount = await this.contractService.getLeftClaimsCountForTier(daoAddress, ctx.session.walletAddr, tier);
		} catch (error) {
			this.logger.error(`[MulticurrencyOpenSale] Can't get left claims for tier`, { error, daoAddress, tier, userId });
			throw error;
		}

		return {
			isAvailable: availableCount !== 0,
			availableCount
		};
	}

	@Query(() => GetMintedNftResponse)
	async getMintedNftMeta(
		@Args('daoAddress') daoAddress: string,
		@Args('tier') tier: string,
		@Context('req') ctx: express.Request
	) {
		const userId = ctx.session?.userId;
		const currentUser = await this.userService.getUserById(userId);

		if (!currentUser) throw new NotFoundError('User not found');

		const data = await this.userService.getMintedNftMeta(daoAddress, tier, currentUser.walletAddress);

		return data;
	}
}
