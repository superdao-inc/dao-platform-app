import { DaoMemberRole } from 'src/types/types.generated';

type RoleTranslationKey = 'roles.sudo' | 'roles.creator' | 'roles.member' | 'roles.admin';

export const getRoleTranslationKey = (role: DaoMemberRole): RoleTranslationKey => {
	const roleNamesByRole: Record<DaoMemberRole, RoleTranslationKey> = {
		[DaoMemberRole.Sudo]: 'roles.sudo',
		[DaoMemberRole.Creator]: 'roles.creator',
		[DaoMemberRole.Admin]: 'roles.admin',
		[DaoMemberRole.Member]: 'roles.member'
	};

	return roleNamesByRole[role];
};

export const isAdmin = (role?: DaoMemberRole) => {
	if (!role) return false;

	return [DaoMemberRole.Admin, DaoMemberRole.Creator, DaoMemberRole.Sudo].includes(role);
};
