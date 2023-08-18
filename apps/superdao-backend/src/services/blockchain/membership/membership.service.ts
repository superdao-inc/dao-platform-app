import { Injectable } from '@nestjs/common';

import { GetDaosMembersRequest } from './membership.types';

import { BlockchainMembershipHelper } from './membership.helper';

@Injectable()
export class BlockchainMembershipService {
	constructor(private readonly blockchainMembershipHelper: BlockchainMembershipHelper) {}

	public async getDaosAdmins(requestParams: GetDaosMembersRequest) {
		const { daoAddresses } = requestParams;

		const validAddresses = this.blockchainMembershipHelper.validateDaoAdresses(daoAddresses);

		const { deprecatedAddresses, actualAddresses } =
			this.blockchainMembershipHelper.separateDaoAdresses(validAddresses);

		const adminsByActualAddresses = await this.blockchainMembershipHelper.getDaosAdmins(actualAddresses);

		const adminsByDeprecatedAddresses = await this.blockchainMembershipHelper.getDeprecatedDaosAdmins(
			deprecatedAddresses
		);

		return {
			...adminsByActualAddresses,
			...adminsByDeprecatedAddresses
		};
	}

	public async getDaosMembers(requestParams: GetDaosMembersRequest) {
		const { daoAddresses } = requestParams;

		const validAddresses = this.blockchainMembershipHelper.validateDaoAdresses(daoAddresses);

		const { deprecatedAddresses, actualAddresses } =
			this.blockchainMembershipHelper.separateDaoAdresses(validAddresses);

		const membersByActualAddress = await this.blockchainMembershipHelper.getDaosMembers(actualAddresses);

		const membersByDeprecatedAddress = await this.blockchainMembershipHelper.getDeprecatedDaosMembers(
			deprecatedAddresses
		);

		return {
			...membersByActualAddress,
			...membersByDeprecatedAddress
		};
	}
}
