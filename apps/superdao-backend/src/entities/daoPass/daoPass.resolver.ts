import { Context, Query, Resolver } from '@nestjs/graphql';

import express from 'express';
import { UseGuards } from '@nestjs/common';
import { NotFoundError } from 'src/exceptions';
import { AuthGuard } from 'src/auth.guard';
import { UserService } from 'src/entities/user/user.service';

@Resolver()
export class DaoPassResolver {
	constructor(private readonly userService: UserService) {}

	@UseGuards(AuthGuard)
	@Query(() => Boolean)
	async verifyWhitelist(@Context('req') ctx: express.Request) {
		const currentUser = await this.userService.getUserById(ctx.session?.userId);
		if (!currentUser) throw new NotFoundError('User not found');

		return false;
	}
}
