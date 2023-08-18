import { Injectable } from '@nestjs/common';
import { Kernel__factory } from 'src/typechain';
import { ContractHelper } from './contract.helper';

const TREASURY_APP_ID = 'WALLET';

@Injectable()
export class TreasuryHelperService extends ContractHelper {
	constructor(kernelFactory: Kernel__factory) {
		super(kernelFactory, TREASURY_APP_ID);
	}
}
