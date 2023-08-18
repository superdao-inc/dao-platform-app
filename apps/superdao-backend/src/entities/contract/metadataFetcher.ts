import { superdaoIPFS } from 'src/blockchain/services/superdaoIPFS';
import { IPFS_PREFIX } from 'src/constants';
import { ERC721CollectionMetadata, ERC721TokenMetadata } from 'src/types/metadata';

export class MetadataFetcher {
	private baseURI: string;

	constructor(contractBaseUri: string) {
		this.baseURI = contractBaseUri.replace(IPFS_PREFIX, '')?.replace('/', '');
	}

	async getCollectionMetadata(): Promise<ERC721CollectionMetadata> {
		const metadata: ERC721CollectionMetadata = await superdaoIPFS.getFile(`${this.baseURI}/contract`);

		return metadata;
	}

	async getTierMetadata(tier: string): Promise<ERC721TokenMetadata> {
		const metadata: ERC721TokenMetadata = await superdaoIPFS.getFile(`${this.baseURI}/${tier.toUpperCase()}`);

		return metadata;
	}

	async getTierFile(tier: string, num: number | string): Promise<ERC721TokenMetadata> {
		const files: ERC721TokenMetadata = await superdaoIPFS.getFile(`${this.baseURI}/${tier.toUpperCase()}/${num}`);

		return files;
	}

	getBaseURI() {
		return this.baseURI;
	}
}
