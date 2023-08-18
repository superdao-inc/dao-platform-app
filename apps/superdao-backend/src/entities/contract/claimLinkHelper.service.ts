import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { wallet } from 'src/blockchain/common';
import { ERC721LinkClaim, ERC721LinkClaim__factory, Kernel__factory } from 'src/typechain';
import { ContractHelper } from './contract.helper';

@Injectable()
export class ClaimLinkHelperService extends ContractHelper {
	constructor(kernelFactory: Kernel__factory) {
		super(kernelFactory, 'ERC721_LINK_CLAIM');
	}

	getContractByContractAddress(contractAddress: string): ERC721LinkClaim {
		return ERC721LinkClaim__factory.connect(contractAddress, wallet);
	}

	async getContractByDaoAddress(daoAddress: string) {
		const addr = await this.getContractAddress(daoAddress);
		if (!addr) {
			const errorMsg = `[ClaimLinkContract] Can't get contract for daoAddress`;
			throw new Error(errorMsg);
		}

		return this.getContractByContractAddress(addr);
	}

	async claim(daoAddress: string, to: string, secret: string, merkleProof: string[], tierValue: string) {
		const claim = await this.getContractByDaoAddress(daoAddress);

		const bytesLikeTierValue = ethers.utils.formatBytes32String(tierValue.toUpperCase());

		return claim.populateTransaction.claim(to, secret, merkleProof, bytesLikeTierValue);
	}

	async checkIsLinkAlreadyUsed(daoAddress: string, secret: string) {
		const claim = await this.getContractByDaoAddress(daoAddress);

		return claim.linkAlreadyUsed(secret);
	}

	async checkIsClaimActive(daoAddress: string) {
		let isActive;
		try {
			const claim = await this.getContractByDaoAddress(daoAddress);
			isActive = await claim.isActive();
		} catch (e) {
			isActive = false;
		}
		return isActive;
	}
}
