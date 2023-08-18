import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/entities/user/user.model';

@Entity({ name: 'onboarding' })
@ObjectType()
@InputType('OnboardingInput')
export class Onboarding extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => [String])
	@Column({ type: 'varchar', array: true, default: [] })
	visitedPages: string[];

	@OneToOne(() => User, (user) => user.onboarding, { onDelete: 'CASCADE' })
	user: User;
}
