import { ethers } from 'ethers';
import { Injectable, Logger } from '@nestjs/common';
import { config, provider } from 'src/config';
import { EmailService } from 'src/services/email/email.service';

const THRESHOLD = ethers.BigNumber.from(100).pow(18); // 10 MATIC

@Injectable()
export class GaslessWalletService {
	readonly signer: ethers.Wallet;
	private readonly logger = new Logger(GaslessWalletService.name);
	private readonly emailService: EmailService;

	constructor(emailService: EmailService) {
		this.emailService = emailService;
		this.signer = new ethers.Wallet(config.ethers.gaslessWalletPrivateKey, provider);
	}

	async checkBalance() {
		const balance = await this.signer.getBalance();
		const address = await this.signer.getAddress();

		this.logger.log(`Balance of the gasless wallet ${address} is ${balance} wei (MATIC)`);

		const shouldNotify = balance.lte(THRESHOLD);
		if (shouldNotify) {
			const balanceInMatics = ethers.utils.formatEther(balance);

			await this.emailService.sendTopUpGaslessWalletMessage(balanceInMatics, address);
		}
	}
}
