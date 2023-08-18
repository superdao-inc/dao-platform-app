import {
	Args,
	ArgsType,
	Context,
	Field,
	Int,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
	Root
} from '@nestjs/graphql';

import { UseGuards } from '@nestjs/common';
import { Treasury } from './treasury.model';
import { TreasuryService } from './treasury.service';
import { ContextWithDataSources } from 'src/types/contextWithDataSources';
import { AuthGuard } from 'src/auth.guard';
import { NftInfo } from 'src/entities/walletNfts/walletNfts.model';
import { WalletTransactionsResponse } from '../wallet/wallet.types';
import { TransactionsArgs } from './dto/transactions.dto';
import { TokenBalance } from '../wallet/dto/tokenBalance.dto';
import { Wallet } from '../wallet/wallet.model';
import { WalletService } from '../wallet/wallet.service';

@ArgsType()
export class TreasuryRequest {
	@Field(() => String, { nullable: true })
	daoId: string;

	@Field(() => Int, { defaultValue: 0, nullable: true })
	offset?: number;
}

@Resolver(() => Treasury)
export class TreasuryResolver {
	constructor(private readonly treasuryService: TreasuryService, private readonly walletService: WalletService) {}

	@Query(() => Treasury, { name: 'treasury', nullable: true })
	async treasury(@Args('daoId') daoId: string): Promise<Treasury | null> {
		return this.treasuryService.getTreasury(daoId);
	}

	@Query(() => String, { nullable: true })
	async treasuryMainWalletAddress(@Args('daoId') daoId: string) {
		return this.treasuryService.getTreasuryMainWalletAddress(daoId);
	}

	@ResolveField(() => [NftInfo], { nullable: true })
	async nfts(
		@Parent() treasury: Treasury,
		@Args('offset', { type: () => Int }) offset: number,
		@Args('isPublic', { nullable: true }) isPublic: boolean,
		@Context() ctx: ContextWithDataSources
	): Promise<NftInfo[]> {
		const wallets = await this.walletService.getWalletsWithBalance(ctx.dataSources.covalentAPI, treasury.dao.id);
		const treasuryAddresses = wallets.map((wallet) => wallet.address);

		return this.treasuryService.getNftsForAddresses(treasuryAddresses, { offset, isPublic });
	}

	@ResolveField(() => [Wallet], { name: 'wallets' })
	async wallets(@Root() treasury: Treasury, @Context() ctx: ContextWithDataSources): Promise<Wallet[]> {
		return this.walletService.getWalletsWithBalance(ctx.dataSources.covalentAPI, treasury.dao.id);
	}

	@ResolveField(() => [TokenBalance])
	async assets(@Root() treasury: Treasury, @Context() ctx: ContextWithDataSources): Promise<TokenBalance[]> {
		return this.treasuryService.getTokensBalance(ctx.dataSources.covalentAPI, treasury.dao.id);
	}

	@Query(() => [TokenBalance])
	tokensBalance(@Args('daoId') daoId: string, @Context() ctx: ContextWithDataSources): Promise<TokenBalance[]> {
		const tokenBalance = this.treasuryService.getTokensBalance(ctx.dataSources.covalentAPI, daoId);

		return tokenBalance;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async updateTreasuryValue(@Context() ctx: ContextWithDataSources) {
		// lopson: no need to await – this operation takes more than 50 seconds
		this.treasuryService.updateDaosTreasuryValue(ctx.dataSources.covalentAPI);
	}

	@Query(() => WalletTransactionsResponse)
	async daoTransactions(@Args() transactionsArgs: TransactionsArgs, @Context() ctx: ContextWithDataSources) {
		const transactions = await this.treasuryService.getTransactions(ctx.dataSources.covalentAPI, transactionsArgs);

		return {
			items: transactions,
			limit: transactionsArgs.limit,
			offset: transactionsArgs.offset
		};
	}
}
