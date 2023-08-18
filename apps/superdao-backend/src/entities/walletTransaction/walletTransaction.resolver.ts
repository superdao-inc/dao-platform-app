import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Repository } from 'typeorm';
import express from 'express';
import { UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EcosystemType } from '@sd/superdao-shared';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';
import { Wallet } from '../wallet/wallet.model';
import { UpsertTransactionMetaInput } from './models/upsertTransactionMetaInput';
import { WalletTransactionMeta } from './models/walletTransactionMeta.model';
import { ForbiddenError } from 'src/exceptions';
import { AuthGuard } from 'src/auth.guard';

@Resolver(() => WalletTransactionMeta)
export class WalletTransactionResolver {
	constructor(
		@InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
		@InjectRepository(WalletTransactionMeta) private walletTransactionMetaRepository: Repository<WalletTransactionMeta>,
		private readonly daoMembershipService: DaoMembershipService
	) {}

	@UseGuards(AuthGuard)
	@Mutation((_type) => WalletTransactionMeta)
	async upsertTransactionMeta(
		@Context('req') ctx: express.Request,
		@Args('data') upsertTransactionInput: UpsertTransactionMetaInput
	): Promise<WalletTransactionMeta> {
		if (upsertTransactionInput.ecosystem !== EcosystemType.EVM || upsertTransactionInput.chainId === undefined) {
			throw new ForbiddenError('EVM compatible chains only, chainId considered.');
		}
		const userId = ctx.session?.userId;
		const wallet = await this.walletRepository.findOneOrFail({
			where: {
				// ecosystem: upsertTransactionInput.ecosystem,
				// chainId: upsertTransactionInput.chainId,
				id: upsertTransactionInput.walletId
			}
		});

		const isAllowed = await this.daoMembershipService.checkAccessLevel({
			userId,
			daoId: wallet.daoId,
			allowedRoles: [DaoMemberRole.Member, DaoMemberRole.Admin, DaoMemberRole.Creator]
		});

		if (!isAllowed) {
			throw new ForbiddenError('You are not allowed to perform this action');
		}

		// console.log(wallet);
		// const walletAddress = etherUtils.getAddress(wallet.address);
		// const data = await MoralisService.getTransaction(upsertTransactionInput.hash); // TODO use covalent instead of moralis
		// if (
		// 	etherUtils.getAddress(data.to_address) !== walletAddress &&
		// 	etherUtils.getAddress(data.from_address) !== walletAddress
		// ) {
		// 	throw new ForbiddenError('Transaction is not related to this wallet');
		// }

		let transactionMeta = await this.walletTransactionMetaRepository
			.createQueryBuilder('transactionMeta')
			.select('transactionMeta')
			.where({
				ecosystem: upsertTransactionInput.ecosystem,
				chainId: upsertTransactionInput.chainId,
				hash: upsertTransactionInput.hash
			})
			.getOne();

		transactionMeta = await this.walletTransactionMetaRepository.save({
			...transactionMeta,
			hash: upsertTransactionInput.hash,
			chainId: upsertTransactionInput.chainId,
			description: upsertTransactionInput.description
		});

		return transactionMeta;
	}
}
