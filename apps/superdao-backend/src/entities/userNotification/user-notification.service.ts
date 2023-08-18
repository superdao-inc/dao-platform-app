import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundError } from 'src/exceptions';
import { UserNotification } from './userNotification.model';

@Injectable()
export class UserNotificationService {
	constructor(@InjectRepository(UserNotification) private usersRepository: Repository<UserNotification>) {}

	async findUser(userId: string) {
		return this.usersRepository.findOneBy({ id: userId });
	}

	async haveNotSeenNotifications(userId: string) {
		const result = await this.usersRepository.findOneBy({ userId, seen: false });
		return !!result;
	}

	async getNotifications(userId: string) {
		return this.usersRepository
			.createQueryBuilder('notifications')
			.where('notifications.userId = :userId', { userId })
			.andWhere('notifications.seen = :seen', { seen: false })
			.getMany();
	}

	async toggleUserNotification(id: string) {
		const notification = await this.usersRepository.findOneBy({ id });
		if (!notification) throw new NotFoundError('Notification was not found');

		notification.seen = true;
		await notification.save();
	}
}
