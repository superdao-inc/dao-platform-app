import { ethers } from 'ethers';
import { Injectable } from '@nestjs/common';
import { CallForwarder, CallForwarder__factory } from 'src/typechain';
import { config, provider } from 'src/config';
import { GaslessWalletService } from 'src/entities/metaTransaction/services/gaslessWallet.service';
import { MetaTxParams, MetaTxMessage } from '@sd/superdao-shared';

const DOMAIN = 'Superdao';
const VERSION = 'v2.0.22';
const EXECUTE_SINGLE = 'executeSingle((address,address,uint256,uint256,bytes),bytes)';

@Injectable()
export class CallForwarderService {
	private readonly callForwarder: CallForwarder;
	private readonly gaslessWalletService: GaslessWalletService;

	constructor(gaslessWalletService: GaslessWalletService) {
		this.gaslessWalletService = gaslessWalletService;
		this.callForwarder = new ethers.Contract(
			config.contracts.callForwarder,
			CallForwarder__factory.abi,
			gaslessWalletService.signer
		) as CallForwarder;
	}

	async buildMetaTxParams(args: Omit<MetaTxMessage, 'nonce'>): Promise<MetaTxParams> {
		const { from, to, value, data } = args;
		const nonce = await this.callForwarder.getNonce(from);

		return {
			primaryType: 'ForwardRequest',
			types: {
				ForwardRequest: [
					{ name: 'from', type: 'address' },
					{ name: 'to', type: 'address' },
					{ name: 'value', type: 'uint256' },
					{ name: 'nonce', type: 'uint256' },
					{ name: 'data', type: 'bytes' }
				]
			},
			domain: {
				name: DOMAIN,
				version: VERSION,
				chainId: config.polygon.chainId,
				verifyingContract: this.callForwarder.address
			},
			message: { from, to, value, nonce: Number(nonce), data }
		};
	}

	async executeSingleTx(message: MetaTxMessage, signature: string) {
		await this.gaslessWalletService.checkBalance();

		const gasPrice = await provider.getGasPrice();
		const estimatedGasLimit = await this.callForwarder.estimateGas[EXECUTE_SINGLE](message, signature);

		// adding +30% in order to prevent "transaction underpriced" error
		const gasLimit = estimatedGasLimit.mul(130).div(100);

		return this.callForwarder[EXECUTE_SINGLE](message, signature, {
			gasLimit,
			gasPrice
		});
	}
}
