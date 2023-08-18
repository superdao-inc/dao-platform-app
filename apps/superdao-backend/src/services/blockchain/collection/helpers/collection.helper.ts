import { Injectable } from '@nestjs/common';
import { isAddress } from 'ethers/lib/utils';

import { assertNotValid } from 'src/exceptions/assert';

@Injectable()
export class BlockchainCollectionHelper {
	// private readonly logger = new Logger(BlockchainCollectionHelper.name);

	validateGetCollectionParams(daoAddress: string) {
		assertNotValid(isAddress(daoAddress), 'daoAddress is not a valid address');
	}
}
