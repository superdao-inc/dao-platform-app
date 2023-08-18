import { Field, ObjectType } from '@nestjs/graphql';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';

@ObjectType()
export class WalletOwner {
	@Field(() => String, { nullable: true })
	id: string | null;

	@Field(() => String)
	walletAddress: string;

	@Field(() => String, { nullable: true })
	avatar: string | null;

	@Field(() => String, { nullable: true })
	displayName: string | null;

	@Field(() => Boolean)
	isDaoMember: boolean;

	@Field(() => DaoMemberRole, { nullable: true })
	role: DaoMemberRole | null;
}
