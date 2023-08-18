import { ethers } from 'ethers';
import { Bytes } from 'ethers';
import { config, provider } from 'src/config';
import { log } from 'src/utils/logger';
import { feeService } from 'src/services/feeService';
import { Injectable } from '@nestjs/common';

const { ethers: ethersConfig } = config;
const { privateKey } = ethersConfig;

@Injectable()
export class EthersService {
	private readonly _signer: ethers.Signer;

	constructor() {
		this._signer = new ethers.Wallet(privateKey, provider);
		this.startupLog();
	}

	private async startupLog() {
		log.info(`GlobalSigner inited with wallet ${await this._signer.getAddress()}`);
	}

	public getSigner() {
		return this._signer;
	}

	public async getGasPrice() {
		const result = await this._signer.getGasPrice();
		return result;
	}

	public async signMessage(message: Bytes | string): Promise<string> {
		return this._signer.signMessage(message);
	}

	public async signTransaction(transaction: ethers.PopulatedTransaction): Promise<string> {
		return this._signer.signTransaction({ ...transaction, type: transaction.type ?? undefined });
	}

	public async sendTransaction(
		transaction: ethers.PopulatedTransaction | ethers.ContractTransaction,
		nonce?: number
	): Promise<ethers.providers.TransactionResponse> {
		const from = await this._signer.getAddress();
		const changedFromTx = { ...transaction, type: transaction.type ?? undefined, from };

		// get max fees from gas station
		const gas = await feeService.getGas();

		return this._signer.sendTransaction({
			...changedFromTx,
			maxFeePerGas: gas.maxFeePerGas,
			maxPriorityFeePerGas: gas.maxPriorityFeePerGas,
			gasLimit: gas.gasLimit,
			nonce
		});
	}
}
