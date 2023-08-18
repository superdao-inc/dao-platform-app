import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import express from 'express';
import { AuthGuard } from 'src/auth.guard';
import { TransactionType } from 'src/entities/transaction/transaction.types';
import {
	NftAdminUpdateCollectionTxInput,
	NftAdminCollectionResponse,
	NftAdminUpdateCollectionInput,
	NftAdminUpdateSaleTx,
	NftAdminUpdateSaleInput
} from './nftAdmin.types';
import { NftAdminService } from './nftAdmin.service';

@Resolver()
export class NftAdminResolver {
	constructor(private nftAdminService: NftAdminService) {}

	@UseGuards(AuthGuard)
	@Query(() => NftAdminCollectionResponse, { nullable: true })
	async nftAdminCollection(@Args('daoAddress') daoAddress: string) {
		return this.nftAdminService.getCollection(daoAddress);
	}

	@UseGuards(AuthGuard)
	@Query(() => TransactionType)
	async nftAdminUpdateCollectionTx(
		@Args('daoAddress') daoAddress: string,
		@Args('data') data: NftAdminUpdateCollectionTxInput
	) {
		return this.nftAdminService.updateCollectionTx(daoAddress, data);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async nftAdminUpdateCollection(
		@Args('data') data: NftAdminUpdateCollectionInput,
		@Context('req') ctx: express.Request
	) {
		const currentUserId = ctx.session?.userId;

		return this.nftAdminService.updateCollection(data, currentUserId);
	}

	@UseGuards(AuthGuard)
	@Query(() => TransactionType, { nullable: true })
	async nftAdminUpdateSaleTx(@Args('updateSaleData') updateSaleData: NftAdminUpdateSaleTx) {
		const { daoAddress, type, options } = updateSaleData;
		return this.nftAdminService.updateSaleTx(daoAddress, type, options);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async nftAdminUpdateSale(@Args('data') data: NftAdminUpdateSaleInput, @Context('req') ctx: express.Request) {
		const currentUserId = ctx.session?.userId;

		return this.nftAdminService.processUpdateSale(data, currentUserId);
	}
}
