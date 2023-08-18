import { ethers } from 'ethers';
import { Injectable, Logger } from '@nestjs/common';
import { wallet } from 'src/blockchain/common';
import { provider } from 'src/config';
import { ERC721OpenSale, ERC721OpenSale__factory, Kernel__factory } from 'src/typechain';
import { SalesControllerHelperService } from 'src/entities/contract/salesControllerHelper.service';
import { ContractHelper } from './contract.helper';
import { OpenSaleContract } from './openSaleContract';
import { BuyNftOptions } from './types';
import { SaleTypeIndex } from '@sd/superdao-shared';

const OPEN_SALE_APP_ID = 'ERC721_OPEN_SALE';

@Injectable()
export class OpenSaleHelperService extends ContractHelper {
	private readonly logger = new Logger(OpenSaleHelperService.name);

	constructor(
		kernelFactory: Kernel__factory,
		private readonly salesControllerHelperService: SalesControllerHelperService
	) {
		super(kernelFactory, OPEN_SALE_APP_ID);
	}

	getContractByContractAddress(contractAddress: string): ERC721OpenSale {
		return ERC721OpenSale__factory.connect(contractAddress, wallet);
	}

	async getContractByDaoAddress(daoAddress: string): Promise<OpenSaleContract | null> {
		try {
			const address = await this.salesControllerHelperService.getSaleAddress(daoAddress, SaleTypeIndex.public);

			if (!address) {
				throw new Error(`[OpenSaleContractHelper] Can't get contract for daoAddress`);
			}

			const contract = this.getContractByContractAddress(address);

			return new OpenSaleContract(contract, address);
		} catch (e) {
			return null;
		}
	}

	async getSaleAddress(daoAddress: string): Promise<string> {
		const contract = await this.getContractByDaoAddress(daoAddress);

		return contract?.address ?? ethers.constants.AddressZero;
	}

	async isSaleActive(daoAddress: string): Promise<boolean> {
		const contract = await this.getContractByDaoAddress(daoAddress);

		return contract?.isActive() ?? false;
	}

	async getTokenSaleAddress(daoAddress: string): Promise<string> {
		try {
			const contract = await this.getContractByDaoAddress(daoAddress);

			return contract?.getTokenAddress() ?? '';
		} catch (e) {
			return '';
		}
	}

	// @ts-ignore
	async getLeftClaimsCountForTier(daoAddress: string, userWalletAddress: string, tier: string): Promise<number> {
		// const contract = await this.getContractByDaoAddress(daoAddress);

		// return contract.getLeftClaimsCountForTier(userWalletAddress, tier);
		return 1000;
	}

	/** Step 1 in buying NFTs.
	 * We have to ask the user for permission
	 * transfer a certain amount of money from his wallet to a treasurer's wallet
	 */
	async getAllowanceTx(daoAddress: string, options: BuyNftOptions) {
		const { tokenAddress, tier } = options;
		this.logger.log(`Starting to getAllowanceTx`, { daoAddress, options });
		const contract = await this.getContractByDaoAddress(daoAddress);
		const contractAddress = contract?.address;

		// First, ask the contract for the NFT price in tokenAddress
		let price = await contract?.getTierPriceInToken(tokenAddress, tier);

		// If the payment is not in the token in which the price is stored,
		// then you need to set a slippage of 2% in case of a change in the course
		const contractTokenAddress = await contract?.getTokenAddress();
		const PRICE_MAY_CHANGE = tokenAddress !== contractTokenAddress;
		if (PRICE_MAY_CHANGE) {
			const slippage = price?.div(100).mul(2);
			price = price?.add(slippage as any);
		}

		// Then we take the contract of the token passed to us
		const erc20Contract = await this.getERC20Contract(tokenAddress);

		/** Then we construct a transaction,
		 * by signing which, the user will allow
		 * transfer the sale contract {contract} from your wallet
		 * {price} money in token {tokenAddress}
		 */
		const tx = await erc20Contract.populateTransaction.approve(contractAddress, price);

		this.logger.log('Got allowance tx: ', { daoAddress, options, tx, contractAddress, price });
		return tx;
	}

	/** Step 2 in buying NFTs.
	 * We receive a transaction for the purchase method itself
	 */
	async getBuyNftTx(daoAddress: string, options: BuyNftOptions) {
		const contract = await this.getContractByDaoAddress(daoAddress);

		return contract?.getBuyNftTx(options);
	}

	/** Get the ERC-20 token contract at its address
	 */
	private async getERC20Contract(tokenAddress: string) {
		// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol#L136
		const abi = ['function approve(address _spender, uint256 _value) public returns (bool success)'];

		return new ethers.Contract(tokenAddress, abi, provider);
	}
}
