import { Injectable } from '@nestjs/common';

import { ERC721__factory } from 'src/typechain';

import { CONTRACT_NAME, wallet } from '../../blockchain.constants';
import { BlockchainBaseService } from '../base.service';

import { GetErc721ContractRequest } from './erc721.types';

@Injectable()
export class BlockchainERC721ContractService extends BlockchainBaseService {
	private erc721ControllerFactory: ERC721__factory;

	constructor() {
		super(CONTRACT_NAME.ERC721);

		this.erc721ControllerFactory = new ERC721__factory(wallet);
	}

	public async getErc721Contract(requestParams: GetErc721ContractRequest) {
		const { erc721Address } = requestParams;

		const erc721Controller = this.erc721ControllerFactory.attach(erc721Address);

		return erc721Controller;
	}
}
