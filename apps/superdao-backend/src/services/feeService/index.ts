import { ethers } from 'ethers';
import axios from 'axios';
import { config } from 'src/config';
import { log } from 'src/utils/logger';
import { Keys, GasStationResponse } from './types';
import { GUARANTEE_GAS_LIMIT } from './constants';

const {
	polygon: { gasStationUrl }
} = config;

class FeeService {
	public async getGas(transactionType: Keys = 'fast') {
		// get max fees from gas station
		let maxFeePerGas = ethers.BigNumber.from(40000000000); // fallback to 40 gwei
		let maxPriorityFeePerGas = ethers.BigNumber.from(40000000000); // fallback to 40 gwei

		try {
			const { data }: { data: GasStationResponse } = await axios({
				method: 'get',
				url: gasStationUrl
			});
			maxFeePerGas = ethers.utils.parseUnits(Math.ceil(data[transactionType].maxFee) + '', 'gwei');
			maxPriorityFeePerGas = ethers.utils.parseUnits(Math.ceil(data[transactionType].maxPriorityFee) + '', 'gwei');
		} catch (e) {
			log.error('Error fetching gas station data');
		}

		return { maxFeePerGas, maxPriorityFeePerGas, gasLimit: GUARANTEE_GAS_LIMIT };
	}
}

export const feeService = new FeeService();
