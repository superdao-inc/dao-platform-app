import { Injectable } from '@nestjs/common';

import { GraphClient } from 'src/services/the-graph/graph-polygon/graph.client';
import { NotFoundError } from 'src/exceptions';

import { WalletRequest } from './treasury.types';

@Injectable()
export class BlockchainTreasuryService {
	constructor(private readonly graphClient: GraphClient) {}

	public async wallet(walletRequest: WalletRequest) {
		const { daoAddress } = walletRequest;

		const response = await this.graphClient.getDaoTreasury(daoAddress);

		if (!response.daos.length) throw new NotFoundError();

		return { result: response.daos[0].treasury };
	}
}
