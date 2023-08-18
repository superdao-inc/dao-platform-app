import { InputType, Field } from '@nestjs/graphql';
import { DaoMemberRole } from 'src/entities/daoMembership/daoMembership.types';
@InputType()
export class ChangeMemberRoleInput {
	@Field(() => String)
	daoAddress: string;

	@Field(() => String)
	userWalletAddress: string;

	@Field(() => DaoMemberRole)
	role: DaoMemberRole;
}
