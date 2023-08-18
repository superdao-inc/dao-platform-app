// entities
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

// dto
import { AuthGuard } from 'src/auth.guard';
import {
	GetBanMembersMetaTxParamsInput,
	MetaTxParams,
	SendMetaTxParamsInput
} from 'src/entities/metaTransaction/metaTransaction.types';
import { AdminMetaTransactionService } from 'src/entities/metaTransaction/services/adminMetaTransaction.service';
import { TransactionType } from 'src/entities/transaction/transaction.types';
import { CallForwarderService } from 'src/entities/metaTransaction/services/callForwarder.service';
import { toGraphqlJsonBigNumber } from 'src/utils/toGraphqlJsonBigNumber';
import { AirdropTxInput } from 'src/entities/transaction/dto/airdropTx.dto';
import { Erc721PropertiesMetaTransactionService } from 'src/entities/metaTransaction/services/erc721PropertiesMetaTransaction.service';
import express from 'express';
import { NotFoundError } from 'src/exceptions';

@Resolver()
export class MetaTransactionResolver {
	constructor(
		private readonly adminMetaTransactionService: AdminMetaTransactionService,
		private readonly erc721PropertiesMetaTransactionService: Erc721PropertiesMetaTransactionService,
		private readonly callForwarderService: CallForwarderService
	) {}

	@UseGuards(AuthGuard)
	@Query(() => MetaTxParams)
	async getBanMembersMetaTxParams(
		@Args('GetBanMembersMetaTxParamsInput') data: GetBanMembersMetaTxParamsInput,
		@Context('req') context: express.Request
	) {
		const walletAddr = context.session?.walletAddr;
		if (!walletAddr) throw new NotFoundError('walletAddr was not found');

		return this.adminMetaTransactionService.getBanMembersMetaTxParams({
			...data,
			signerAddress: walletAddr
		});
	}

	@UseGuards(AuthGuard)
	@Query(() => MetaTxParams)
	async getAirdropMetaTxParams(@Args() data: AirdropTxInput, @Context('req') context: express.Request) {
		const { daoAddress, items } = data;

		const walletAddr = context.session?.walletAddr;
		if (!walletAddr) throw new NotFoundError('walletAddr was not found');

		return this.erc721PropertiesMetaTransactionService.getAirdropMetaTxParams({
			daoAddress,
			participants: items,
			signerAddress: walletAddr
		});
	}

	@UseGuards(AuthGuard)
	@Mutation(() => TransactionType)
	async sendMetaTransaction(@Args('SendMetaTxParamsInput') data: SendMetaTxParamsInput) {
		const { signature, message } = data;

		const tx = await this.callForwarderService.executeSingleTx(message, signature);
		const { gasLimit, maxFeePerGas, maxPriorityFeePerGas, value, ...restTx } = tx;

		return {
			...restTx,
			gasLimit: toGraphqlJsonBigNumber(gasLimit),
			maxFeePerGas: toGraphqlJsonBigNumber(maxFeePerGas),
			maxPriorityFeePerGas: toGraphqlJsonBigNumber(maxPriorityFeePerGas),
			value: toGraphqlJsonBigNumber(value)
		};
	}
}
