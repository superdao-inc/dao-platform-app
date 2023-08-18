import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { assert } from 'node:console';
import express from 'express';

import { AuthGuard } from 'src/auth.guard';
import { UpdateUserEmailInput } from './dto/updateUserEmailInput.dto';
import { UpdateUserEmailResponse } from './dto/updateUserEmailResponse.dto';
import { EmailSettingsService } from './emailSettings.service';

@Resolver(Boolean)
export class EmailSettingsResolver {
	constructor(private readonly emailSettingsService: EmailSettingsService) {}

	@Mutation(() => UpdateUserEmailResponse)
	@UseGuards(AuthGuard)
	async sendEmailVerificationMessage(@Context('req') req: express.Request): Promise<UpdateUserEmailResponse> {
		const { session } = req;
		const { userId, nextAttemptToSendEmail: prevAttemptToSendEmail } = session ?? {};
		assert(userId, Error('Not found "userId" for send verification message'));

		this.emailSettingsService.checkNextAttemptTimestamp(prevAttemptToSendEmail);

		await this.emailSettingsService.sendEmailVerificationMessage(userId);

		const nextAttemptToSendEmail = this.emailSettingsService.generateNextAttemptTimestamp();

		// Mutate session
		if (session) session.nextAttemptToSendEmail = nextAttemptToSendEmail;

		return { nextAttemptToSendEmail };
	}

	@Mutation(() => UpdateUserEmailResponse)
	@UseGuards(AuthGuard)
	async updateUserEmail(
		@Args('updateUserEmailInput') { email }: UpdateUserEmailInput,
		@Context('req') req: express.Request
	): Promise<UpdateUserEmailResponse> {
		const { session } = req;
		const { userId, nextAttemptToSendEmail: prevAttemptToSendEmail } = session ?? {};
		assert(userId, Error('Not found "userId" for update email'));

		this.emailSettingsService.checkNextAttemptTimestamp(prevAttemptToSendEmail);

		await this.emailSettingsService.updateUserEmail(userId, email);

		const nextAttemptToSendEmail = this.emailSettingsService.generateNextAttemptTimestamp();

		// Mutate session
		if (session) session.nextAttemptToSendEmail = nextAttemptToSendEmail;

		return { nextAttemptToSendEmail };
	}

	@Mutation(() => Boolean)
	@UseGuards(AuthGuard)
	async removeUserEmail(@Context('req') req: express.Request): Promise<boolean> {
		const { session } = req;
		const { userId } = session ?? {};
		assert(userId, Error('Not found "userId" for remove email'));

		await this.emailSettingsService.removeUserEmail(userId);

		// Mutate session
		if (session?.nextAttemptToSendEmail) delete session.nextAttemptToSendEmail;

		return true;
	}
}
