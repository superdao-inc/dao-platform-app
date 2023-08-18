// entities
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './attachment/attachment.model';
import { Post, Post as PostEntity } from './post.model';

// types
import { AttachmentType } from './attachment/attachment.types';
import { CreatePostInput } from './dto/createPost.dto';

// utils
import { validateFile } from 'src/utils/upload';
import { defaultPosts } from './constants';
import { NotFoundError } from 'src/exceptions';
import { DaoMembership } from 'src/entities/daoMembership/daoMembership.model';

type GetFeedParams =
	| {
			offset?: number;
			daoId: string;
	  }
	| {
			offset?: number;
			userId: string;
	  };

@Injectable()
export class PostService {
	constructor(
		@InjectRepository(Post) private readonly postRepository: Repository<Post>,
		@InjectRepository(Attachment) private readonly attachmentRepository: Repository<Attachment>
	) {}

	async createPost(createPostData: CreatePostInput) {
		const post = new PostEntity();

		post.daoId = createPostData.daoId;
		post.text = createPostData.text;
		post.attachments = [];

		await post.save();

		for (const fileId of createPostData.attachments) {
			const isValid = await validateFile(fileId);
			if (!isValid) continue;

			const attachment = new Attachment();
			attachment.postId = post.id;
			attachment.type = AttachmentType.image;
			attachment.image = { fileId };
			await attachment.save();

			post.attachments.push(attachment);
		}

		await post.save();

		return post;
	}

	async createDefaultPosts(daoId: string) {
		for (let postData of defaultPosts) {
			const createPostData = {
				...postData,
				daoId
			};

			await this.createPost(createPostData);
		}
	}

	async getFeeds(params: GetFeedParams) {
		const { offset = 0 } = params || {};

		let query = this.postRepository.createQueryBuilder('post');

		if ('daoId' in params) {
			query = query.where('post.daoId = :daoId', { daoId: params.daoId });
		} else {
			query = query.where((builder) => {
				return `post.daoId IN ${builder
					.subQuery()
					.select('daoMembership.daoId')
					.from(DaoMembership, 'daoMembership')
					.where('daoMembership.userId = :userId', { userId: params.userId })
					.getQuery()}`;
			});
		}

		const [items, count] = await query
			.orderBy('post.createdAt', 'DESC')
			.limit(10)
			.offset(offset)
			.leftJoinAndSelect('post.attachments', 'attachments')
			.leftJoinAndSelect('post.dao', 'dao')
			.getManyAndCount();

		return {
			count,
			items
		};
	}

	async getById(postId: string) {
		return this.postRepository.findOneBy({ id: postId });
	}

	async getPostById(id: string): Promise<Post> {
		return this.postRepository
			.createQueryBuilder('post')
			.where('post.id = :id', { id })
			.leftJoinAndSelect('post.attachments', 'attachments')
			.leftJoinAndSelect('post.dao', 'dao')
			.getOneOrFail();
	}

	async deleteById(postId: string) {
		const post = await this.postRepository.findOne({ where: { id: postId }, relations: ['attachments'] });
		if (!post) throw new NotFoundError('Post not found');

		await this.attachmentRepository.remove(post.attachments);

		return this.postRepository.delete(postId);
	}

	async getAttachmentsByPostId(postId: string): Promise<Attachment[]> {
		return this.attachmentRepository.find({ where: { postId } });
	}
}
