import { PopulatedTransaction } from 'ethers';
import { isAddress, keccak256, solidityKeccak256 } from 'ethers/lib/utils';
import { MerkleTree } from 'merkletreejs';
import FormData from 'form-data';

// exceptions
import { throwErrorByCode, NotFoundError, ValidationError } from 'src/exceptions';

// services
import { WhitelistClaim } from 'src/blockchain/whitelistClaim';
import { infuraService } from 'src/blockchain/services/infura';
import { EnsResolver } from 'src/services/the-graph/ens/ensResolver';
import { superdaoIPFS } from 'src/blockchain/services/superdaoIPFS';

// types
import { WhitelistParticipant } from 'src/entities/whitelist/whitelist.types';

type WhitelistItem = Pick<WhitelistParticipant, 'walletAddress' | 'tiers'>;

type WhitelistFileContent = {
	dao: string;
	tree: string;
	whitelist: WhitelistItem[];
};

export class Collection {
	private static buildMerkleTree(whitelist: WhitelistItem[]): MerkleTree {
		const solidityWhitelist = whitelist.reduce<string[]>((acc, { walletAddress, tiers }) => {
			if (!tiers.length) acc.push(solidityKeccak256(['address'], [walletAddress]));

			tiers.forEach((tier) => acc.push(solidityKeccak256(['address', 'string'], [walletAddress, tier.toUpperCase()])));
			return acc;
		}, []);

		return new MerkleTree(solidityWhitelist, keccak256, { sort: true });
	}

	static async saveClaimWhitelistTx(
		daoAddress: string,
		whitelistReq: WhitelistParticipant[]
	): Promise<PopulatedTransaction> {
		if (!isAddress(daoAddress)) throw new ValidationError('Invalid DAO address');

		const promises = whitelistReq.map(async (whitelistItem) => {
			const walletAddress = await EnsResolver.resolve(whitelistItem.walletAddress);

			return { tiers: whitelistItem.tiers, walletAddress: walletAddress!.toLowerCase() };
		});

		const whitelist = await Promise.all(promises);
		if (!whitelist.length) throw new ValidationError('No whitelist items provided');

		try {
			const merkleTree = this.buildMerkleTree(whitelist);
			const rootHash = merkleTree.getHexRoot();

			const formData = new FormData();
			const fileContent: WhitelistFileContent = {
				dao: daoAddress,
				tree: merkleTree.toString(),
				whitelist
			};
			formData.append('file', JSON.stringify(fileContent), {
				filename: `${daoAddress}_whitelist`,
				contentType: 'application/json'
			});

			const ipfsResponse = await infuraService.saveFileToIpfs(formData);
			const tx = await WhitelistClaim.erc721WhitelistClaimSetMerkleTree(daoAddress, rootHash, ipfsResponse.Hash);

			return {
				to: tx.to,
				data: tx.data
			};
		} catch (e: any) {
			throw new ValidationError(e?.message ? e?.message : 'Invalid whitelist items provided');
		}
	}

	static async verifyWalletAddress(daoAddress: string, walletAddress: string, tier: string): Promise<boolean> {
		if (!isAddress(daoAddress)) throw new ValidationError('Invalid DAO address');
		if (!isAddress(walletAddress)) throw new ValidationError('Invalid user wallet address');
		if (!tier) throw new ValidationError('Tier was not provided');

		try {
			const ipfsHash = await WhitelistClaim.getIpfsHash(daoAddress);
			const ipfsJson = await superdaoIPFS.getFile<WhitelistFileContent>(ipfsHash);
			if (!ipfsJson.whitelist) throw new NotFoundError('No whitelist found');

			const merkleTree = this.buildMerkleTree(ipfsJson.whitelist);
			const elementTier = solidityKeccak256(['address', 'string'], [walletAddress.toLowerCase(), tier.toUpperCase()]);
			const proof = merkleTree.getProof(elementTier);
			const rootHash = merkleTree.getHexRoot();

			const isValid = MerkleTree.verify(proof, elementTier, rootHash, keccak256, { sort: true });
			if (!isValid) throw new ValidationError('Invalid proof provided');

			return true;
		} catch (e) {
			throwErrorByCode(e);
			throw e;
		}
	}

	static async getERC721Address(daoAddress: string): Promise<string> {
		if (!isAddress(daoAddress)) throw new ValidationError('Invalid DAO address');

		try {
			return WhitelistClaim.getERC721Address(daoAddress);
		} catch (e) {
			throwErrorByCode(e);
			throw e;
		}
	}

	static async claimWhitelistTx(daoAddress: string, toAddress: string, tier: string): Promise<PopulatedTransaction> {
		if (!isAddress(daoAddress)) throw new ValidationError('Invalid DAO address');
		if (!isAddress(toAddress)) throw new ValidationError('Invalid user wallet address');
		if (!tier) throw new ValidationError('Tier was not provided');

		try {
			const ipfsHash = await WhitelistClaim.getIpfsHash(daoAddress);
			const ipfsJson = await superdaoIPFS.getFile<WhitelistFileContent>(ipfsHash);
			if (!ipfsJson.whitelist) throw new NotFoundError('No whitelist found');

			const merkleTree = this.buildMerkleTree(ipfsJson.whitelist);
			const elementTier = solidityKeccak256(['address', 'string'], [toAddress.toLowerCase(), tier.toUpperCase()]);
			const hexProof = merkleTree.getHexProof(elementTier);
			const proof = merkleTree.getProof(elementTier);
			const rootHash = merkleTree.getHexRoot();

			const isValid = MerkleTree.verify(proof, elementTier, rootHash, keccak256, { sort: true });
			if (!isValid) throw new ValidationError('Invalid proof provided');

			const tx = await WhitelistClaim.erc721WhitelistClaim(daoAddress, hexProof, toAddress, tier);

			return { to: tx.to, data: tx.data };
		} catch (e) {
			throwErrorByCode(e);
			throw e;
		}
	}

	static async getClaims(daoAddress: string, to: string, tier: string): Promise<number> {
		return WhitelistClaim.claims(daoAddress, to, tier);
	}
}
