import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Dao } from 'src/entities/dao/dao.model';
import { User } from 'src/entities/user/user.model';

@Entity({ name: 'likes' })
@ObjectType()
export class Like extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String)
	@Column({ type: 'uuid' })
	daoId: string;

	@Field(() => String)
	@Column({ type: 'uuid' })
	userId: string;

	@Field(() => Dao)
	@ManyToOne(() => Dao, (dao) => dao.daoMembership)
	dao: Dao;

	@Field(() => User)
	@ManyToOne(() => User, (user) => user.daoMembership)
	user: User;
}
