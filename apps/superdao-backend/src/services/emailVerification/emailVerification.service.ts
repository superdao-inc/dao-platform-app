import assert from 'node:assert';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { NotFoundError } from '../../exceptions';
import { User } from '../../entities/user/user.model';
import { EmailService } from '../email/email.service';
import { VerificationService } from '../verification/verification.service';
import { EmailVerificationError, EmailVerificationErrorCode } from './emailVerification.error';

const TOKEN_OPTIONS = { expiresIn: '20m' };

type EmailTokenPayload = { userId: string; email: string };
type SendConfirmationEmailOptions = { displayName?: string } & EmailTokenPayload;

@Injectable()
export class EmailVerificationService {
	private readonly logger = new Logger(EmailVerificationService.name);

	constructor(
		private readonly verificationService: VerificationService,
		private readonly emailService: EmailService,
		@InjectDataSource() private dataSource: DataSource
	) {}

	async sendConfirmationEmail({ userId, email, displayName }: SendConfirmationEmailOptions): Promise<void> {
		const token = this.verificationService.generateToken({ userId, email }, TOKEN_OPTIONS);
		await this.emailService.sendEmailConfirmationMessage({ userId, email, displayName, token });
	}

	async verify(token: string): Promise<string> {
		const data = await this.verificationService.verifyTokenAsync<EmailTokenPayload>(token);

		this.logger.log('Verification token data', data);

		await this.dataSource.transaction(async (manager) => {
			const { userId: id, email } = data;

			const user = await manager.findOneBy(User, { id });

			assert(user, new NotFoundError('User not found'));
			assert(
				user.email === email,
				new EmailVerificationError(
					'User email and verification email do not match',
					EmailVerificationErrorCode.NOT_MATCH
				)
			);
			assert(
				!user.emailVerified,
				new EmailVerificationError('Email already verified', EmailVerificationErrorCode.ALREADY_VERIFIED)
			);

			await manager.update(User, { id }, { email, emailVerified: true });
		});

		return data.email;
	}
}
