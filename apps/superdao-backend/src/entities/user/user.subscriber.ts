import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { Logger } from '@nestjs/common';
import { User } from 'src/entities/user/user.model';
import { EnsResolver } from 'src/services/the-graph/ens/ensResolver';

type SubscriptionType = 'insert' | 'update';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
	private readonly logger = new Logger(UserSubscriber.name);

	constructor(dataSource: DataSource) {
		dataSource.subscribers.push(this);
	}

	listenTo() {
		return User;
	}

	async afterInsert(event: InsertEvent<User>) {
		const walletAddress = event.entity.walletAddress;
		const ens = await this.getEns(walletAddress, 'insert');

		if (ens) {
			await event.manager.update(User, { walletAddress }, { ens });
			this.logger.log(`ENS updated for user ${walletAddress} (insert)`);
		}
	}

	async afterUpdate(event: UpdateEvent<User>) {
		const walletAddress = event.entity?.walletAddress;
		if (walletAddress) {
			const ens = await this.getEns(walletAddress, 'update');
			await event.manager.update(User, { walletAddress }, { ens });

			this.logger.log(`ENS updated for user ${walletAddress} (update)`);
		}
	}

	private async getEns(walletAddress: string, subscriptionType: SubscriptionType) {
		try {
			return await EnsResolver.lookup(walletAddress);
		} catch (e) {
			this.logger.error(`Error in subscription:`, { subscriptionType, walletAddress, e });
			return null;
		}
	}
}
