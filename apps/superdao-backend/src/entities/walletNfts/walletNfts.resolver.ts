import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import find from 'lodash/find';

import { ChangeNftsVisibility, GetWalletNftsArgs, GetIsTiersTransferable } from './walletNfts.dto';
import { NftInfo, NftTransferableInfo } from './walletNfts.model';
import { WalletNftsService } from './walletNftsService';
import { AuthGuard } from 'src/auth.guard';
import { TreasuryService } from '../treasury/treasury.service';
import { WalletService } from '../wallet/wallet.service';
import { CollectionsService } from 'src/entities/collections/collections.service';

const MAX_PUBLIC_NFTS_COUNT = 21;

@Resolver()
export class WalletNftsResolver {
	constructor(
		private readonly walletNftService: WalletNftsService,
		private readonly walletService: WalletService,
		private readonly treasuryService: TreasuryService,
		private readonly collectionsService: CollectionsService
	) {}

	@Query(() => [NftInfo])
	async getWalletNfts(@Args() args: GetWalletNftsArgs) {
		return await this.walletNftService.getWalletNfts(args.walletId, args.chainId);
	}

	@Query(() => [NftTransferableInfo])
	async getIsTiersTransferable(@Args() args: GetIsTiersTransferable) {
		const data = await Promise.allSettled(
			args.nfts.map(async (arg) => {
				try {
					const collection = await this.collectionsService.getCollectionByCollectionAddress(arg.collectionAddress);
					const tier = find(collection.tiers, ({ tierName }) => tierName === arg.tierName);

					return { id: arg.id, isTransferable: tier?.isTransferable };
				} catch (error) {
					return { id: arg.id, isTransferable: false };
				}
			})
		);

		return data.map((item) => (item as PromiseFulfilledResult<any>).value);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async changeNftsVisibility(@Args() args: ChangeNftsVisibility) {
		const wallets = await this.walletService.getDaoWallets(args.daoId);

		const treasuryAddresses = wallets.map((wallet) => wallet.address) || [];

		const publicNfts = await this.treasuryService.getNftsForAddresses(treasuryAddresses, { isPublic: true });

		if (args.isPublic && publicNfts.length >= MAX_PUBLIC_NFTS_COUNT) {
			throw new Error(`Max public ntfs count exceeded`);
		}

		return this.walletNftService.changeNftsVisibility(args.nftsIds, args.isPublic);
	}
}
