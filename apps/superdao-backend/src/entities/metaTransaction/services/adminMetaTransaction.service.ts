import { Injectable } from '@nestjs/common';
import { AdminControllerHelperService } from 'src/entities/contract/adminControllerHelper.service';
import { CallForwarderService } from 'src/entities/metaTransaction/services/callForwarder.service';

type GetBanMembersMetaTxArgs = {
	signerAddress: string;
	daoAddress: string;
	tokenIds: string[];
};

@Injectable()
export class AdminMetaTransactionService {
	private readonly adminContractHelper: AdminControllerHelperService;
	private readonly callForwarderService: CallForwarderService;

	constructor(adminContractHelper: AdminControllerHelperService, callForwarderService: CallForwarderService) {
		this.adminContractHelper = adminContractHelper;
		this.callForwarderService = callForwarderService;
	}

	async getBanMembersMetaTxParams(args: GetBanMembersMetaTxArgs) {
		const { signerAddress, daoAddress, tokenIds } = args;

		const callData = this.adminContractHelper.contractInterface.encodeFunctionData('batchBurn', [tokenIds]);
		const adminContract = await this.adminContractHelper.getContractByDaoAddress(daoAddress);

		return this.callForwarderService.buildMetaTxParams({
			from: signerAddress,
			to: adminContract.address,
			value: 0,
			data: callData
		});
	}
}
