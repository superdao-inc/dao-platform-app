import { MemberRolesResponse } from 'src/entities/daoMembership/daoMembership.types';

export const toPublicMemberRoles = (membersCount: any[]): MemberRolesResponse => {
	return membersCount.reduce((curr, { role: roleName, count }) => {
		// eslint-disable-next-line no-param-reassign
		curr[roleName] = +count;
		return curr;
	}, {});
};
