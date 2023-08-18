import { Resolver, Query, Context, Mutation, Args, ID, ResolveField, Root } from '@nestjs/graphql';
import express from 'express';
import { UseGuards } from '@nestjs/common';
import { UserNotification } from './userNotification.model';
import { User } from 'src/entities/user/user.model';
import { AuthGuard } from 'src/auth.guard';
import { UserNotificationService } from 'src/entities/userNotification/user-notification.service';

@Resolver(() => UserNotification)
export class UserNotificationResolver {
	constructor(private readonly userNotificationService: UserNotificationService) {}

	@UseGuards(AuthGuard)
	@Query(() => [UserNotification])
	async userNotifications(@Context('req') ctx: express.Request) {
		const userId = ctx.session?.userId;
		return this.userNotificationService.getNotifications(userId);
	}

	@UseGuards(AuthGuard)
	@Query(() => Boolean)
	hasNewNotifications(@Context('req') ctx: express.Request) {
		const userId = ctx.session?.userId;
		return this.userNotificationService.haveNotSeenNotifications(userId);
	}

	@UseGuards(AuthGuard)
	@ResolveField(() => User)
	user(@Root() notification: UserNotification) {
		return this.userNotificationService.findUser(notification.userId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async toggleNotification(@Args('notificationId', { type: () => ID }) notificationId: string) {
		await this.userNotificationService.toggleUserNotification(notificationId);
		return true;
	}
}
