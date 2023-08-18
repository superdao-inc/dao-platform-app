import { ethers, PopulatedTransaction } from 'ethers';
import { ERC721WhitelistClaim, ERC721WhitelistClaim__factory, Kernel__factory } from 'src/typechain';
import { wallet } from 'src/blockchain/common';

export class WhitelistClaim {
	private static _contractName = 'ERC721_WHITELIST_CLAIM_1';

	private static _erc721ContractName = 'ERC721';

	private static _erc721WhitelistClaimFactory = new ERC721WhitelistClaim__factory(wallet);

	private static _kernelFactory = new Kernel__factory(wallet);

	public static async getERC721Address(daoAddress: string): Promise<string> {
		const kernel = this._kernelFactory.attach(daoAddress);
		try {
			return await kernel.getAppAddress(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(this._erc721ContractName)));
		} catch (e) {
			throw new Error('Dao address is not exist');
		}
	}

	private static async getERC721WhitelistClaimContract(daoAddress: string): Promise<ERC721WhitelistClaim> {
		const kernel = this._kernelFactory.attach(daoAddress);
		const appAddress: string = await kernel.getAppAddress(
			ethers.utils.keccak256(ethers.utils.toUtf8Bytes(this._contractName))
		);

		return this._erc721WhitelistClaimFactory.attach(appAddress);
	}

	static async erc721WhitelistClaimSetMerkleTree(
		daoAddress: string,
		merkleRoot: string,
		merkleProofIpfsHash: string
	): Promise<PopulatedTransaction> {
		const erc721WhitelistClaim = await this.getERC721WhitelistClaimContract(daoAddress);

		return erc721WhitelistClaim.populateTransaction.setMerkleTree(
			merkleRoot,
			ethers.utils.toUtf8Bytes(merkleProofIpfsHash)
		);
	}

	static async claims(daoAddress: string, to: string, tier: string): Promise<number> {
		const erc721WhitelistSale = await this.getERC721WhitelistClaimContract(daoAddress);
		const parsedTier = ethers.utils.formatBytes32String(tier.toUpperCase());
		const claimLimit = await erc721WhitelistSale.claims(to, parsedTier);

		return claimLimit.toNumber();
	}

	static async erc721WhitelistClaim(
		daoAddress: string,
		merkleProof: string[],
		to: string,
		tier: string
	): Promise<PopulatedTransaction> {
		const erc721WhitelistSale = await this.getERC721WhitelistClaimContract(daoAddress);
		const parsedTier = ethers.utils.formatBytes32String(tier.toUpperCase());

		return await erc721WhitelistSale.populateTransaction.claim(to, merkleProof, parsedTier);
	}

	static async getIpfsHash(daoAddress: string) {
		const erc721WhitelistSale = await this.getERC721WhitelistClaimContract(daoAddress);
		const merkleTreeURI = await erc721WhitelistSale.merkleTreeURI();

		return ethers.utils.toUtf8String(merkleTreeURI);
	}
}
