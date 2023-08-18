import { Kernel__factory } from 'src/typechain';
import { isContractExist, getKeccak256 } from './utils';

export abstract class ContractHelper {
	kernelFactory: Kernel__factory;
	appId: string;

	constructor(kernelFactory: Kernel__factory, appId: string) {
		this.kernelFactory = kernelFactory;
		this.appId = appId;
	}

	async getContractAddress(daoAddress: string): Promise<string | null> {
		const kernel = this.kernelFactory.attach(daoAddress);

		const addr: string = await kernel.getAppAddress(getKeccak256(this.appId));

		const contractExists = isContractExist(addr);
		if (!contractExists) {
			return null;
		}

		return addr;
	}
}
