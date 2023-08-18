import { ethers } from 'ethers';
import { Injectable, Logger } from '@nestjs/common';
import { formatBytes32String } from 'ethers/lib/utils';
import { ERC721Properties__factory } from 'src/typechain';
import { AirdropParticipant } from 'src/entities/nft/nft.types';
import { resolveAirdropEns } from 'src/entities/contract/utils';
import { ERC721HelperService } from 'src/entities/contract/erc721Helper.service';
import { CallForwarderService } from 'src/entities/metaTransaction/services/callForwarder.service';
import { MetaTxParams } from '@sd/superdao-shared';
import { AdminControllerHelperService } from 'src/entities/contract/adminControllerHelper.service';

type GetAirdropMetaTxArgs = {
	signerAddress: string;
	daoAddress: string;
	participants: AirdropParticipant[];
};

@Injectable()
export class Erc721PropertiesMetaTransactionService {
	private readonly adminContractHelper: AdminControllerHelperService;
	private readonly contractInterface: ethers.utils.Interface;
	private readonly erc721HelperService: ERC721HelperService;
	private readonly callForwarderService: CallForwarderService;
	private readonly logger = new Logger(Erc721PropertiesMetaTransactionService.name);

	constructor(
		erc721HelperService: ERC721HelperService,
		callForwarderService: CallForwarderService,
		adminContractHelper: AdminControllerHelperService
	) {
		this.erc721HelperService = erc721HelperService;
		this.callForwarderService = callForwarderService;
		this.adminContractHelper = adminContractHelper;
		this.contractInterface = new ethers.utils.Interface(ERC721Properties__factory.abi);
	}

	async getAirdropMetaTxParams(args: GetAirdropMetaTxArgs): Promise<MetaTxParams> {
		const { signerAddress, daoAddress, participants } = args;

		let participantsWithResolvedEns = [];
		try {
			participantsWithResolvedEns = await resolveAirdropEns(participants);
		} catch (e) {
			this.logger.error(e);
			throw e;
		}

		const contractAddress = (await this.erc721HelperService.getContractAddress(daoAddress)) || '';
		const adminContractAddress = (await this.adminContractHelper.getContractAddress(daoAddress)) || '';
		const to = new Array(participantsWithResolvedEns.length).fill(contractAddress);

		const mintCallData = participantsWithResolvedEns.map((participant) => {
			return this.contractInterface.encodeFunctionData('mint', [
				participant.walletAddress,
				formatBytes32String(participant.tiers[0])
			]);
		});

		const batchCallData = this.adminContractHelper.contractInterface.encodeFunctionData('batchCall', [
			to,
			mintCallData
		]);

		return this.callForwarderService.buildMetaTxParams({
			from: signerAddress,
			to: adminContractAddress,
			value: 0,
			data: batchCallData
		});
	}
}
