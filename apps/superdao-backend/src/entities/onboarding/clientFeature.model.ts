import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'client_features' })
@ObjectType()
@InputType('ClientFeatureInput')
export class ClientFeature extends BaseEntity {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => String)
	@Column({ type: 'text' })
	name: string;

	@Field()
	@Column({ nullable: false, type: 'timestamptz', default: () => 'NOW()' })
	createdAt: Date;
}
