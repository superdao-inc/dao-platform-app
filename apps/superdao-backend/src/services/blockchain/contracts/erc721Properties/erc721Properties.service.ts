import { Injectable } from '@nestjs/common';

import { ERC721Properties__factory } from 'src/typechain';

import { CONTRACT_NAME, wallet } from '../../blockchain.constants';

import { BlockchainBaseService } from '../base.service';

import { GetERC721PropertiesContractRequest } from './erc721Properties.types';

@Injectable()
export class BlockchainERC721PropertiesContractService extends BlockchainBaseService {
	private erc721PropertiesFactory: ERC721Properties__factory;

	constructor() {
		super(CONTRACT_NAME.ERC721);

		this.erc721PropertiesFactory = new ERC721Properties__factory(wallet);
	}

	public async getERC721PropertiesContract(requestParams: GetERC721PropertiesContractRequest) {
		const { erc721PropertiesAddress } = requestParams;

		const erc721Properties = this.erc721PropertiesFactory.attach(erc721PropertiesAddress);

		return erc721Properties;
	}
}
