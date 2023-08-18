import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import express from 'express';
import { ContextWithDataSources } from 'src/types/contextWithDataSources';
import { UserService } from 'src/entities/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(private readonly userService: UserService) {}

	async canActivate(context: ExecutionContext) {
		const request: express.Request = GqlExecutionContext.create(context).getContext<ContextWithDataSources>().req;

		const userId = request.session?.userId;
		if (!userId) return false;

		const user = await this.userService.getUserById(userId);
		return Boolean(user);
	}
}
