import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

import { Attachment } from './attachment/attachment.model';
import { Dao } from 'src/entities/dao/dao.model';

@Entity({ name: 'posts' })
@ObjectType()
@InputType('PostInput')
export class Post extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String)
	@Column({ type: 'uuid' })
	daoId: string;

	@Field(() => String)
	@Column({ nullable: false, type: 'text' })
	text: string;

	@Field(() => [Attachment])
	@OneToMany(() => Attachment, (attachment) => attachment.post, { onDelete: 'CASCADE' })
	attachments: Attachment[];

	@ManyToOne(() => Dao, (dao) => dao.posts, { onDelete: 'CASCADE' })
	dao: Dao;

	@Field()
	@Column({ nullable: false, type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;

	@Field()
	@Column({ nullable: false, type: 'timestamptz', default: () => 'NOW()' })
	updatedAt: Date;
}
