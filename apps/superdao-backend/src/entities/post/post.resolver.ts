import { Args, Context, Mutation, ObjectType, Query, ResolveField, Resolver, Root } from '@nestjs/graphql';

import express from 'express';
import { UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.model';

// entities
import { Attachment } from 'src/entities/post/attachment/attachment.model';
import { Dao } from 'src/entities/dao/dao.model';

// services
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
import { DaoMembershipService } from 'src/entities/daoMembership/daoMembership.service';

// errors
import { NotFoundError, ValidationError } from 'src/exceptions';

// types
import { FeedRequest } from 'src/entities/post/dto/getPost.dto';
import { CreatePostInput } from 'src/entities/post/dto/createPost.dto';
import { UpdatePostInput } from 'src/entities/post/dto/updatePost.dto';
import { DeletePostInput } from 'src/entities/post/dto/deletePost.dto';
import { AttachmentType } from 'src/entities/post/attachment/attachment.types';

// utils
import { validateFile } from 'src/utils/upload';
import PaginatedResponse from 'src/gql/pagination';
import { PostService } from './post.service';
import { AuthGuard } from 'src/auth.guard';

@ObjectType()
class FeedResponse extends PaginatedResponse(Post) {}

@Resolver(() => Post)
export class PostResolver {
	constructor(
		@InjectRepository(Dao) private readonly daoRepository: Repository<Dao>,
		@InjectRepository(Post) private readonly postRepository: Repository<Post>,
		@InjectRepository(Attachment) private readonly attachmentRepository: Repository<Attachment>,
		private readonly postService: PostService,
		private readonly daoMembershipService: DaoMembershipService
	) {}

	@UseGuards(AuthGuard)
	@Query(() => FeedResponse)
	feed(@Args() feedRequest: FeedRequest, @Context('req') ctx: express.Request): Promise<FeedResponse> {
		const { daoId, offset } = feedRequest;

		if (daoId) {
			return this.postService.getFeeds({ offset, daoId });
		}

		const userId = ctx.session?.userId;
		return this.postService.getFeeds({ offset, userId });
	}

	@UseGuards(AuthGuard)
	@ResolveField(() => Dao)
	dao(@Root() post: Post) {
		return this.daoRepository.findOneBy({ id: post.daoId });
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Post)
	async createPost(@Args('createPostData') createPostData: CreatePostInput, @Context('req') ctx: express.Request) {
		const userId = ctx.session?.userId;
		await this.daoMembershipService.checkAccess(userId, createPostData.daoId, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);
		const post = await this.postService.createPost(createPostData);

		return this.postService.getPostById(post.id);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Post)
	async editPost(
		@Args('updatePostData') updatePostData: UpdatePostInput,
		@Context('req') ctx: express.Request
	): Promise<Post> {
		const userId = ctx.session?.userId;
		const { postId, text, attachments: newAttachments } = updatePostData;

		const post = await this.postRepository.findOneBy({ id: postId });
		if (!post) throw new NotFoundError(`Post with id: ${postId} not found`);

		await this.daoMembershipService.checkAccess(userId, post.daoId, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);

		for (const fileId of updatePostData.attachments) {
			const isValid = await validateFile(fileId);
			if (!isValid) throw new ValidationError(`Invalid attachment id: ${fileId}`);
		}

		const oldAttachments = await this.attachmentRepository.findBy({ postId });

		// Find attachments that exist in database but not in request (need to remove them from DB)
		const attachmentsToDelete = oldAttachments.filter((attachment) => {
			return newAttachments.findIndex((fileId) => fileId === attachment.image?.fileId) === -1;
		});

		// Find attachments that exist in request but not in database (need to save them to DB)
		const attachmentsToAdd = newAttachments.filter((fileId) => {
			return oldAttachments.findIndex((attachment) => fileId === attachment.image?.fileId) === -1;
		});

		await this.attachmentRepository.remove(attachmentsToDelete);

		for (const fileId of attachmentsToAdd) {
			const attachment = new Attachment();
			attachment.postId = postId;
			attachment.type = AttachmentType.image;
			attachment.image = { fileId };
			await attachment.save();
		}

		post.text = text;
		post.updatedAt = new Date();

		await post.save();

		return this.postService.getPostById(postId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async deletePost(@Args('deletePostData') deletePostData: DeletePostInput, @Context('req') ctx: express.Request) {
		const { postId } = deletePostData;
		const userId = ctx.session?.userId;

		const post = await this.postRepository.findOneBy({ id: postId });
		if (!post) throw new NotFoundError(`Post with id ${postId} not found`);

		await this.daoMembershipService.checkAccess(userId, post.daoId, [
			DaoMemberRole.Sudo,
			DaoMemberRole.Creator,
			DaoMemberRole.Admin
		]);
		await this.postService.deleteById(postId);

		return true;
	}
}
