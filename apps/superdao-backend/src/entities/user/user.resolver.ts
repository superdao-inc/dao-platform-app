import express from 'express';
import { Args, Context, Mutation, ObjectType, Query, ResolveField, Resolver, Root } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SocialPipe } from 'src/pipes/social.pipe';
import { ValidationError, NotFoundError } from 'src/exceptions';
import { validateFile } from 'src/utils/upload';
import { DaoMembership } from 'src/entities/daoMembership/daoMembership.model';
import { UpdateUserInput } from 'src/entities/user/dto/updateUser.dto';
import { UserNotification } from 'src/entities/userNotification/userNotification.model';
import PaginatedResponse, { PaginationWithSearch } from 'src/gql/pagination';
import { Onboarding } from 'src/entities/onboarding/onboarding.model';
import { isForbiddenUserSlug } from 'src/utils/forbiddenSlugs';
import { AuthGuard } from 'src/auth.guard';
import { UserService } from 'src/entities/user/user.service';

import { userPlaceholder } from '@sd/superdao-shared';

import { User } from './user.model';
import { Links } from '../links/links.model';
import { LinksService } from '../links/links.service';
import { DaoMembersResponse } from '../daoMembership/daoMembership.resolver';

@ObjectType()
class AllUserResponse extends PaginatedResponse(User) {}

@Resolver(() => User)
export class UserResolver {
	constructor(
		@InjectRepository(DaoMembership) private daoMembershipRepository: Repository<DaoMembership>,
		@InjectRepository(UserNotification) private userNotificationRepository: Repository<UserNotification>,
		private readonly userService: UserService,
		private readonly linksService: LinksService
	) {}

	@Query(() => User)
	currentUser(@Context('req') ctx: express.Request) {
		const userId = ctx.session?.userId;
		if (!userId) {
			return userPlaceholder();
		}

		return this.userService.findByIdOrSlug(userId);
	}

	@Query(() => User)
	async userByIdOrSlug(@Args('idOrSlug') idOrSlug: string) {
		const user = await this.userService.findByIdOrSlug(idOrSlug);
		if (!user) throw new NotFoundError();

		return user;
	}

	@UseGuards(AuthGuard)
	@Query(() => AllUserResponse)
	allUsers(@Args() getAllUsers: PaginationWithSearch) {
		return this.userService.getAllUsers(getAllUsers);
	}

	@Query(() => DaoMembersResponse)
	async daoParticipation(@Args('userId') userId: string): Promise<DaoMembersResponse> {
		const [items, count] = await this.daoMembershipRepository.findAndCountBy({ userId });
		return { items, count };
	}

	@UseGuards(AuthGuard)
	@ResolveField(() => [DaoMembership])
	daoMembership(@Root() user: User) {
		return this.daoMembershipRepository.findBy({ userId: user.id });
	}

	@UseGuards(AuthGuard)
	@ResolveField(() => [UserNotification])
	notifications(@Root() user: User) {
		return this.userNotificationRepository.findBy({ userId: user.id });
	}

	@UseGuards(AuthGuard)
	@Mutation(() => User)
	async updateUser(
		@Args('updateUserData', new SocialPipe()) body: UpdateUserInput,
		@Context('req') ctx: express.Request
	) {
		const contextUser = await this.userService.getUserById(ctx.session?.userId);
		if (contextUser!.id !== body.id && !contextUser!.isSupervisor)
			throw new ValidationError('You are not allowed to update this user');

		const user = await this.userService.getUserById(body.id);
		if (!user) throw new NotFoundError();

		const { cover, avatar } = user;

		const isCoverValid = cover ? await validateFile(cover) : true;
		const isAvatarValid = avatar ? await validateFile(avatar) : true;
		if (!isCoverValid || !isAvatarValid) throw new Error('File ids is not valid');

		if (body.slug) {
			if (isForbiddenUserSlug(body.slug)) {
				throw new ValidationError('Slug is invalid');
			}

			const userBySlug = await this.userService.findBySlug(body.slug);
			if (userBySlug && userBySlug.id !== user.id) {
				throw new ValidationError('Provided public url is reserved. Please try another');
			}

			/*
			  Don't allow user to choose slug the same as other user's id.
			  Otherwise, the current user will not be able to enter their profile (redirect to other user profile
			  will always happen).
			*/
			let userByIdAsSlug: User | null = null;
			try {
				userByIdAsSlug = await this.userService.getUserById(body.slug);
			} catch (e) {
				// slug is not a valid uuid - user id type
				// do nothing
			}
			if (userByIdAsSlug && userByIdAsSlug.id !== user.id) {
				throw new ValidationError('Slug is invalid');
			}
		}

		user.displayName = body.displayName;
		user.slug = body.slug;
		user.bio = body.bio;
		user.avatar = body.avatar;
		user.cover = body.cover;

		let links = await this.linksService.getById(user.links.id);

		if (!links) {
			links = new Links();
			links.entityId = body.id;
		}

		links.telegram = body.telegram;
		links.twitter = body.twitter;
		links.instagram = body.instagram;
		links.site = body.site;
		links.discord = body.discord;

		await links.save();

		user.links = links;

		if (contextUser!.isSupervisor && typeof body.hasBetaAccess === 'boolean') user.hasBetaAccess = body.hasBetaAccess;

		await user?.save();

		return user;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => User)
	async joinBeta(@Context('req') ctx: express.Request) {
		const userId = ctx.session?.userId;

		const user = await this.userService.getUserById(userId);
		if (!user) throw new NotFoundError();

		user.hasBetaAccess = true;

		await user?.save();

		return user;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => User)
	async visitPage(@Args('pagePath') pagePath: string, @Context('req') ctx: express.Request) {
		const user = await this.userService.getUserById(ctx.session!.userId);
		if (!user) throw new NotFoundError();

		const onboarding = user.onboarding ? user.onboarding : new Onboarding();
		const visitedPages = onboarding!.visitedPages || [];

		onboarding.visitedPages = [...visitedPages, pagePath];
		await onboarding.save();

		user.onboarding = onboarding;
		await user.save();

		return user;
	}

	@UseGuards(AuthGuard)
	@Query(() => Boolean)
	async hasCookieDecision(@Context('req') ctx: express.Request): Promise<boolean> {
		const user = await this.userService.getUserById(ctx.session!.userId);
		if (!user) throw new NotFoundError();

		return user.hasCookieDecision;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async decideAboutCookies(
		@Args('decision') decision: boolean,
		@Context('req') ctx: express.Request
	): Promise<boolean> {
		const user = await this.userService.getUserById(ctx.session!.userId);
		if (!user) throw new NotFoundError();

		await this.userService.updateCookieDecision(decision, user);

		return true;
	}
}
