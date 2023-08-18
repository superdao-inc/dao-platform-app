import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';

import { NewNftData, NotificationType } from './userNotification.types';

import { User } from 'src/entities/user/user.model';

@Entity({ name: 'notifications' })
@ObjectType()
@InputType('userNotificationInput')
export class UserNotification extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String)
	@Column({ type: 'uuid' })
	userId: string;

	@Field(() => Boolean)
	@Column({ type: 'boolean', default: false })
	seen: boolean;

	@Field(() => NotificationType)
	@Column({ type: 'enum', enum: NotificationType })
	type: NotificationType;

	@Field(() => NewNftData, { nullable: true })
	@Column({ type: 'json', nullable: true })
	newNftData: NewNftData;

	@Field()
	@Column({ nullable: false, type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;

	@ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
	user: User;
}
