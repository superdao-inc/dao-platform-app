import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotFoundError } from 'src/exceptions';

import {
	AirdropLogParams,
	BanLogParams,
	BuyNftLogParams,
	ClaimNftLogParams,
	LogTransactionFinalizeParams,
	LogTransactionFinalScenario,
	RefferalClaimLogParams,
	WhitelistLogParams
} from './logging.types';

import { AirdropLog } from './models/airdropLog.model';
import { BanLog } from './models/banLog.model';
import { BaseLog } from './models/baseLog';
import { BuyNftLog } from './models/buyNftLog.model';
import { WhitelistLog } from './models/whitelistLog.model';
import { ClaimNftLog } from './models/claimNftLog.model';
import { RefferalClaimLog } from './models/referralClaimLog.model';

@Injectable()
export class TransactionsLoggingService {
	private readonly logger = new Logger(TransactionsLoggingService.name);

	constructor(
		@InjectRepository(BanLog) private readonly banLogRepository: Repository<BanLog>,
		@InjectRepository(AirdropLog) private readonly airdropLogRepository: Repository<AirdropLog>,
		@InjectRepository(WhitelistLog) private readonly whitelistLogRepository: Repository<WhitelistLog>,
		@InjectRepository(BuyNftLog) private readonly buyNftLogRepository: Repository<BuyNftLog>,
		@InjectRepository(ClaimNftLog) private readonly claimNftLogRepository: Repository<ClaimNftLog>,
		@InjectRepository(RefferalClaimLog) private readonly refferalClaimLogRepository: Repository<RefferalClaimLog>
	) {}

	private updateLogStatus(log: BaseLog, scenario: LogTransactionFinalScenario) {
		if (scenario === 'success') {
			log.succededAt = new Date();
		} else {
			log.failedAt = new Date();
		}
	}

	private async finalizeAnyTransaction(
		repository: Repository<BanLog | AirdropLog | WhitelistLog | BuyNftLog | ClaimNftLog | RefferalClaimLog>,
		transactionHash: string,
		scenario: LogTransactionFinalScenario
	) {
		const log = await repository.findOneBy({ transactionHash });

		if (!log) throw new NotFoundError();

		this.updateLogStatus(log, scenario);

		await log.save();
	}

	async logBanTransaction(params: BanLogParams) {
		await this.banLogRepository.create(params).save();
	}

	async finalizeLogBanTransaction(params: LogTransactionFinalizeParams) {
		const { transactionHash, scenario } = params;

		try {
			await this.finalizeAnyTransaction(this.banLogRepository, transactionHash, scenario);
		} catch (e) {
			this.logger.log('[LoggingService] ban log not found', params);
		}
	}

	async logAirdropTransaction(params: AirdropLogParams) {
		await this.airdropLogRepository.create(params).save();
	}

	async finalizeLogAirdropTransaction(params: LogTransactionFinalizeParams) {
		const { transactionHash, scenario } = params;

		try {
			await this.finalizeAnyTransaction(this.airdropLogRepository, transactionHash, scenario);
		} catch (e) {
			this.logger.log('[LoggingService] airdrop log not found', params);
		}
	}

	async logWhitelistTransaction(params: WhitelistLogParams) {
		await this.whitelistLogRepository.create(params).save();
	}

	async finalizeLogWhitelistTransaction(params: LogTransactionFinalizeParams) {
		const { transactionHash, scenario } = params;

		try {
			await this.finalizeAnyTransaction(this.whitelistLogRepository, transactionHash, scenario);
		} catch (e) {
			this.logger.log('[LoggingService] whitelist log not found', params);
		}
	}

	async logBuyNftTransaction(params: BuyNftLogParams) {
		await this.buyNftLogRepository.create(params).save();
	}

	async finalizeLogBuyNftTransaction(params: LogTransactionFinalizeParams) {
		const { transactionHash, scenario } = params;

		try {
			await this.finalizeAnyTransaction(this.buyNftLogRepository, transactionHash, scenario);
		} catch (e) {
			this.logger.log('[LoggingService] buy nft log not found', params);
		}
	}

	async logClaimNftTransaction(params: ClaimNftLogParams) {
		await this.claimNftLogRepository.create(params).save();
	}

	async finalizeLogClaimNftTransaction(params: LogTransactionFinalizeParams) {
		const { transactionHash, scenario } = params;

		try {
			await this.finalizeAnyTransaction(this.claimNftLogRepository, transactionHash, scenario);
		} catch (e) {
			this.logger.log('[LoggingService] claim nft log not found', params);
		}
	}

	async logRefferalClaimTransaction(params: RefferalClaimLogParams) {
		await this.refferalClaimLogRepository.create(params).save();
	}

	async finalizeLogRefferalClaimTransaction(params: LogTransactionFinalizeParams) {
		const { transactionHash, scenario } = params;

		try {
			await this.finalizeAnyTransaction(this.refferalClaimLogRepository, transactionHash, scenario);
		} catch (e) {
			this.logger.log('[LoggingService] refferal claim nft log not found', params);
		}
	}
}
