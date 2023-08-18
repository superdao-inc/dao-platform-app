// eslint-disable-next-line no-shadow
import { ArgsType, Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { Dao } from 'src/entities/dao/dao.model';
import { User } from 'src/entities/user/user.model';
import { PaginationWithSearch } from 'src/gql/pagination';

// eslint-disable-next-line no-shadow
export enum DaoMemberRole {
	Sudo = 'SUDO',
	Creator = 'CREATOR',
	Admin = 'ADMIN',
	Member = 'MEMBER'
}
registerEnumType(DaoMemberRole, {
	name: 'DaoMemberRole'
});

export type UpdateMember = { id: string; tiers?: string[] };

@ObjectType()
@InputType('MemberRolesResponseInput')
export class MemberRolesResponse implements Record<DaoMemberRole, number> {
	@Field(() => Int, { nullable: true })
	SUDO: number;

	@Field(() => Int, { nullable: true })
	CREATOR: number;

	@Field(() => Int, { nullable: true })
	ADMIN: number;

	@Field(() => Int, { nullable: true })
	MEMBER: number;
}

export type CheckAccessParams = {
	daoId: string;
	userId: string;
	allowedRoles: DaoMemberRole[];
};
export type DaoMembersExportRequest = {
	daoId: Dao['id'];
};
export type DaoMemberRequest = {
	daoId: Dao['id'];
	memberId: User['id'];
};

@ArgsType()
export class ExportMembersRequest {
	@Field(() => ID)
	@IsUUID()
	daoId: string;
}

@ArgsType()
export class MemberRoleRequest {
	@Field(() => ID)
	@IsUUID()
	daoId: string;

	@Field(() => ID)
	@IsUUID()
	memberId: string;
}

@ArgsType()
export class DaoMembersRequest extends PaginationWithSearch {
	@Field(() => ID)
	@IsUUID()
	daoId: string;

	@Field(() => [DaoMemberRole], { nullable: true })
	roles?: [DaoMemberRole];
}
