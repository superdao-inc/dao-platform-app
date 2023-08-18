import { BigNumber, ethers } from 'ethers';
import { Injectable, Logger } from '@nestjs/common';
import { ERC721OpenSale } from 'src/typechain';
import { MATIC_TOKEN_ADDRESS } from '@sd/superdao-shared';
import { BuyNftOptions } from './types';
import { bigNumberToNumber } from './utils';

@Injectable()
export class OpenSaleContract {
	private readonly logger = new Logger(OpenSaleContract.name);

	contract: ERC721OpenSale;
	address: string;

	constructor(contract: ERC721OpenSale, address: string) {
		this.contract = contract;
		this.address = address;
	}

	private _formatTier(str: string) {
		return ethers.utils.formatBytes32String(str.toUpperCase());
	}

	async getTokenAddress(): Promise<string> {
		let tokenAddress = '';
		try {
			tokenAddress = await this.contract.tokenSaleAddress();
		} catch (e) {
			this.logger.error(`[MulticurrencyOpenSale] Can't get stableCoinAddress for contract`, {
				address: this.contract.address,
				error: JSON.stringify(e)
			});

			throw e;
		}

		return tokenAddress;
	}

	async isActive(): Promise<boolean> {
		return this.contract.isActive();
	}

	async getLeftClaimsCountForTier(userWalletAddress: string, _tier: string): Promise<number> {
		const tier = this._formatTier(_tier);
		let bigNum;
		try {
			// bigNum = await this.contract.getLeftClaimsForTier(userWalletAddress, tier);
			bigNum = BigNumber.from(1000);
		} catch (e) {
			const errorMsg = `[MulticurrencyOpenSale] Error on getLeftClaimsForTier()`;
			this.logger.error(errorMsg, { userWalletAddress, _tier, tier, e });
			throw e;
		}

		return bigNumberToNumber(bigNum);
	}

	async getTierPriceInContractCurrency(_tier: string): Promise<BigNumber> {
		const tokenAddress = await this.getTokenAddress();
		const tier = this._formatTier(_tier);
		try {
			const price = await this.contract.tierPrices(tier);
			this.logger.log(`Got tier price in contract currency`, { tokenAddress, _tier, price });
			return price;
		} catch (e) {
			this.logger.error("[MulticurrencyOpenSale] Can't get tier price in contract currency", { tier, e });
			throw e;
		}
	}

	async getTierPriceInToken(tokenAddress: string, _tier: string): Promise<BigNumber> {
		const tier = this._formatTier(_tier);

		try {
			const [, tokenPrice] = await this.contract.getPrice(tokenAddress, tier);
			this.logger.log(`Got tokenPrice for NFT multicurrency open sale`, { tokenPrice });

			return tokenPrice;
		} catch (e) {
			this.logger.error(`[MulticurrencyOpenSale] Error while getting price for tier`, {
				tokenAddress,
				_tier,
				tier,
				e
			});
			throw e;
		}
	}

	async getBuyNftTx(options: BuyNftOptions) {
		const { userWalletAddress, tokenAddress } = options;
		const formattedTier = this._formatTier(options.tier);

		try {
			const contractTokenAddress = await this.getTokenAddress();

			const tx = await this.contract.populateTransaction.buy(userWalletAddress, formattedTier, tokenAddress);
			const isPurchaseInMatic = tokenAddress === MATIC_TOKEN_ADDRESS;

			// We set the price in matics manually, for other tokens
			// required amount will be handled via allowance transaction
			if (isPurchaseInMatic && contractTokenAddress !== tokenAddress) {
				this.logger.log(`Call contract.buy() for MATIC/USDC(T) coin with`, {
					userWalletAddress,
					tier: formattedTier,
					tokenAddress: MATIC_TOKEN_ADDRESS
				});
				const price = await this.getTierPriceInToken(tokenAddress, options.tier);
				tx.value = price.mul(102).div(100);
			}

			if (isPurchaseInMatic && contractTokenAddress === MATIC_TOKEN_ADDRESS) {
				tx.value = await this.getTierPriceInContractCurrency(options.tier);
			}

			return tx;
		} catch (e) {
			this.logger.error(`[MulticurrencyOpenSale] Error while getting tx for NFT multicurrency open sale`, {
				e,
				options
			});
		}
	}

	async getTierActivity(tier: string) {
		return this.contract.tiersActive(ethers.utils.formatBytes32String(tier));
	}
}
