import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

import { AttachmentImageData, AttachmentLinkData, AttachmentType } from './attachment.types';
import { Post } from 'src/entities/post/post.model';

@Entity({ name: 'attachments' })
@ObjectType()
@InputType('AttachmentInput')
export class Attachment extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String)
	@Column({ type: 'uuid' })
	postId: string;

	@Column({ nullable: false, type: 'enum', enum: AttachmentType })
	@Field(() => AttachmentType)
	type: AttachmentType;

	@Field(() => AttachmentImageData, { nullable: true })
	@Column({ nullable: true, type: 'json' })
	image: AttachmentImageData;

	@Column({ nullable: true, type: 'json' })
	@Field(() => AttachmentLinkData, { nullable: true })
	link: AttachmentLinkData;

	@Field(() => Post)
	@ManyToOne(() => Post, (post) => post.attachments, { onDelete: 'CASCADE' })
	post: Post;
}
