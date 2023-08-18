import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Dao } from 'src/entities/dao/dao.model';
import { DaoMaskType } from 'src/entities/daoAnalytics/daoAnalytics.types';

@Entity({ name: 'dao_analytics' })
@ObjectType()
@InputType('DaoAnalyticsInput')
export class DaoAnalytics {
	@Field(() => ID)
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Field(() => Dao)
	@OneToOne(() => Dao, (dao) => dao.analytics)
	dao: Dao;

	@Field(() => String)
	@Column({ type: 'uuid' })
	daoId: string;

	@Field(() => DaoMaskType)
	@Column({ type: 'enum', enum: DaoMaskType, default: DaoMaskType.Public })
	mask: DaoMaskType;
}
