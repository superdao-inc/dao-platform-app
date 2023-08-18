import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import express from 'express';
import { Repository } from 'typeorm';
import { AuthGuard } from 'src/auth.guard';
import { ContextWithDataSources } from 'src/types/contextWithDataSources';

import { CreateWalletInput } from './dto/createWallet';
import { DeleteWalletInput } from './dto/deleteWallet';
import { UpdateWalletInput } from './dto/updateWallet';
import { Wallet } from './wallet.model';
import { WalletService } from './wallet.service';
import { GetWalletArgs } from './dto/wallet.dto';

import { WalletTransactionsArgs } from '../walletTransaction/dto/walletTransactions.dto';
import { WalletTransactionArgs } from '../walletTransaction/dto/walletTransaction.dto';
import { WalletTransactionsResponse, WalletTransactionResponse } from './wallet.types';
import { WalletTransactionService } from '../walletTransaction/walletTransaction.service';
import { GetBalanceArgs, TokenBalance } from './dto/tokenBalance.dto';
import { SyncWalletArgs } from './dto/syncWallet.dto';
import { WalletName } from './dto/walletName';

@Resolver(() => Wallet)
export class WalletResolver {
	constructor(
		@InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
		private readonly walletService: WalletService,
		private readonly walletTransactionService: WalletTransactionService
	) {}

	@UseGuards(AuthGuard)
	@Query(() => Wallet, { name: 'wallet' })
	async wallet(@Args() { id }: GetWalletArgs, @Context() ctx: ContextWithDataSources): Promise<Wallet | null> {
		return this.walletService.getWalletWithBalance(ctx.dataSources.covalentAPI, id);
	}

	@UseGuards(AuthGuard)
	@Query(() => [TokenBalance])
	async getBalance(@Args() { address, chainId, ecosystem }: GetBalanceArgs, @Context() ctx: ContextWithDataSources) {
		const balance = await this.walletService.getWalletBalance(ctx.dataSources.covalentAPI, {
			address,
			chainId,
			ecosystem
		});
		return balance.tokensBalance;
	}

	@UseGuards(AuthGuard)
	@Query(() => [TokenBalance])
	async getBalanceWithCovalent(@Args() { address, chainId }: GetBalanceArgs, @Context() ctx: ContextWithDataSources) {
		const balance = await this.walletService.getBalanceWithCovalent(ctx.dataSources.covalentAPI, {
			address,
			chainId
		});
		return balance.tokensBalance;
	}

	@UseGuards(AuthGuard)
	@Query(() => [Wallet])
	allWallets() {
		return this.walletService.getAllWallets();
	}

	@Query(() => WalletTransactionsResponse)
	async walletTransactions(
		@Args() walletTransactionsArgs: WalletTransactionsArgs,
		@Context() ctx: ContextWithDataSources
	) {
		const transactions = await this.walletTransactionService.getWalletTransactions(
			ctx.dataSources.covalentAPI,
			walletTransactionsArgs
		);
		return {
			items: transactions,
			limit: walletTransactionsArgs.limit,
			offset: walletTransactionsArgs.offset
		};
	}

	@Query(() => WalletTransactionResponse)
	async transaction(@Args() walletTransactionArgs: WalletTransactionArgs, @Context() ctx: ContextWithDataSources) {
		const transaction = await WalletTransactionService.getWalletTransaction(
			ctx.dataSources.covalentAPI,
			walletTransactionArgs
		);
		return {
			tx: transaction
		};
	}

	@Query(() => [WalletName])
	async walletsName(@Args('daoId') daoId: string): Promise<WalletName[]> {
		return this.walletService.getWalletsName(daoId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async syncWallet(@Args() syncWalletArgs: SyncWalletArgs) {
		this.walletService.syncWallet(syncWalletArgs.address);
		return true;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Wallet)
	async createWallet(
		@Args('createWalletData') createWalletData: CreateWalletInput,
		@Context('req') ctx: express.Request
	) {
		const userId = ctx.session?.userId;
		const userWalletAddress = ctx.session?.walletAddr;

		const chainId = await this.walletService.checkCreateWalletAccess(
			createWalletData.daoId,
			createWalletData.type,
			createWalletData.address,
			userId,
			userWalletAddress
		);

		return this.walletService.createWallet({ ...createWalletData, chainId: chainId || undefined });
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async updateWallet(
		@Args('updateWalletData') updateWalletData: UpdateWalletInput,
		@Context('req') ctx: express.Request
	) {
		const userId = ctx.session?.userId;
		const userWalletAddress = ctx.session?.walletAddr;

		const wallet = await this.walletService.findWalletByIdOrFail(updateWalletData.id);
		if (wallet.main) return false;
		const dao = await this.walletService.getWalletDao(wallet);

		await this.walletService.checkUpdateWalletAccess(dao.id, wallet.type, wallet.address, userId, userWalletAddress);

		await this.walletRepository.update(wallet.id, updateWalletData);

		return true;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async deleteWallet(
		@Args('deleteWalletData') deleteWalletData: DeleteWalletInput,
		@Context('req') ctx: express.Request
	) {
		const userId = ctx.session?.userId;
		const userWalletAddress = ctx.session?.walletAddr;

		return this.walletService.deleteWallet({ ...deleteWalletData, userId, userWalletAddress });
	}
}
