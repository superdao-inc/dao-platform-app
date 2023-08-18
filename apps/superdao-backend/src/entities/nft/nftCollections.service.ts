import { Injectable } from '@nestjs/common';
import { MessageName } from '@sd/superdao-shared';

import { UserService } from 'src/entities/user/user.service';
import { CacheService, getCollectionsKey, getCollectionTierKey, getUserNftsKey } from 'src/services/cache';
import { SocketService } from 'src/services/socket/socket.service';
import { TransactionMetricsService } from 'src/services/transacton-metrics/transaction-metrics.service';

import { MessageData } from '../blockchain/types';

@Injectable()
export class NftCollectionsService {
	constructor(
		private readonly cacheService: CacheService,
		private readonly userService: UserService,
		private readonly socketService: SocketService,
		private readonly transactionMetricsService: TransactionMetricsService
	) {}

	async airdropSuccess(data: MessageData['AIRDROP']) {
		const { items, daoId, daoSlug, daoAddress, userToNotify, isGasless } = data;

		await this.cacheService.del(getCollectionsKey(daoAddress));

		await Promise.all(
			items.map(async (airdropElem) => {
				const redisKeyFieldData = getUserNftsKey(airdropElem.walletAddress, daoAddress);

				await this.cacheService.hdel(redisKeyFieldData.key, redisKeyFieldData.field);
			})
		);

		const tiersToInvalidate = new Set(items.map((airdropElem) => airdropElem.tiers[0]));

		await Promise.all(
			[...tiersToInvalidate].map(async (tier) => {
				const redisKeyFieldData = getCollectionTierKey(daoAddress, tier);

				await this.cacheService.hdel(redisKeyFieldData.key, redisKeyFieldData.field);
			})
		);

		await this.userService.saveUsersFromAirdrop(items, daoAddress);

		await this.transactionMetricsService.trackSuccessfulAirdrop(isGasless);

		this.socketService.sendPrivateMessage(userToNotify, MessageName.AIRDROP_SUCCESS, {
			daoId,
			daoSlug,
			walletsCount: items.length
		});
	}

	async airdropFailed(data: MessageData['AIRDROP']) {
		const { items, daoId, daoSlug, userToNotify, isGasless } = data;

		await this.transactionMetricsService.trackFailedAirdrop(isGasless);

		this.socketService.sendPrivateMessage(userToNotify, MessageName.AIRDROP_FAIL, {
			daoId,
			daoSlug,
			walletsCount: items.length
		});
	}
}
