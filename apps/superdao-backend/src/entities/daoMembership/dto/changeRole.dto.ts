import { Field, InputType } from '@nestjs/graphql';
import { IsAddress } from 'src/decorators/address.decorator';
import { DaoMemberRole } from '../daoMembership.types';

@InputType()
export class ChangeMembeRoleInput {
	@Field(() => String)
	@IsAddress()
	daoAddress: string;

	@Field(() => String)
	@IsAddress()
	userWalletAddress: string;

	@Field(() => String)
	transactionHash: string;

	@Field(() => DaoMemberRole)
	role: DaoMemberRole;
}
