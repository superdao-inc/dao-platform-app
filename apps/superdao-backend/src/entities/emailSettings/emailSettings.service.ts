import assert from 'node:assert';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { EmailVerificationService } from 'src/services/emailVerification/emailVerification.service';
import { NotFoundError, ValidationError } from 'src/exceptions';
import { User } from '../user/user.model';

const ATTEMT_TIMEOUT_MS = 60 * 1000;

@Injectable()
export class EmailSettingsService {
	constructor(
		private readonly emailVerificationService: EmailVerificationService,
		@InjectDataSource() private dataSource: DataSource,
		@InjectRepository(User) private userRepository: Repository<User>
	) {}

	generateNextAttemptTimestamp(): number {
		return Date.now() + ATTEMT_TIMEOUT_MS;
	}

	checkNextAttemptTimestamp(timestamp?: number): void {
		if (timestamp && timestamp > Date.now()) {
			throw Error('Next attempt timeout is not expired');
		}
	}

	async sendEmailVerificationMessage(userId: string): Promise<void> {
		const user = await this.userRepository.findOneBy({ id: userId });
		assert(user, new NotFoundError('User not found'));
		assert(user.email, new NotFoundError('Email not found'));
		assert(!user.emailVerified, new ValidationError('Email already verified'));

		await this.emailVerificationService.sendConfirmationEmail({
			userId,
			email: user.email,
			displayName: user.displayName ?? ''
		});
	}

	async updateUserEmail(userId: string, email: string): Promise<User> {
		const user = await this.dataSource.transaction(async (manager) => {
			const user = await manager.findOneBy(User, { id: userId });
			assert(user, new NotFoundError('User not found'));
			assert(email !== user.email, new ValidationError('Email addresses are the same'));

			await manager.update(User, { id: userId }, { email, emailVerified: false });

			return user;
		});

		const displayName = user.displayName ?? '';
		await this.emailVerificationService.sendConfirmationEmail({ userId, email, displayName });

		return user;
	}

	async removeUserEmail(userId: string): Promise<void> {
		await this.userRepository.update({ id: userId }, { email: null, emailVerified: false });
	}
}
