import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { ERC721WhitelistSale } from 'src/typechain';
import { BuyWhitelistNftOptions } from 'src/entities/contract/types';
import { toGraphqlJsonBigNumber } from 'src/utils/toGraphqlJsonBigNumber';

@Injectable()
export class PrivateSaleContract {
	private readonly logger = new Logger(PrivateSaleContract.name);

	contract: ERC721WhitelistSale;
	address: string;

	constructor(contract: ERC721WhitelistSale, address: string) {
		this.contract = contract;
		this.address = address;
	}

	async isActive(): Promise<boolean> {
		return this.contract.isActive();
	}

	private _formatTier(str: string) {
		return ethers.utils.formatBytes32String(str.toUpperCase());
	}

	async getTierPriceInContractCurrency(_tier: string): Promise<ethers.BigNumber> {
		const tier = this._formatTier(_tier);
		try {
			const price = await this.contract.tierPrices(tier);
			this.logger.log(`Got tier price in contract currency`, { _tier, price });
			return price;
		} catch (e) {
			this.logger.error("[PrivateSale] Can't get tier price in contract currency", { tier, e });
			throw e;
		}
	}

	async getTierActivity(tier: string) {
		return this.contract.tiersActive(ethers.utils.formatBytes32String(tier));
	}

	async getBuyNftTx(options: BuyWhitelistNftOptions): Promise<ethers.PopulatedTransaction | undefined> {
		const formattedTier = this._formatTier(options.tier);

		try {
			const tx = await this.contract.populateTransaction.buy(options.proof, formattedTier);

			const value = await this.getTierPriceInContractCurrency(options.tier);

			return { ...tx, from: undefined, value: toGraphqlJsonBigNumber(value) as any };
		} catch (e) {
			this.logger.error(`[PrivateSale] Error while getting tx for NFT whitelist sale`, { e, options });
		}
	}
}
