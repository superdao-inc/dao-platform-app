import { Injectable } from '@nestjs/common';
import { superdaoIPFS } from 'src/blockchain/services/superdaoIPFS';
import { config } from 'src/config';
import { IPFS_PREFIX } from 'src/constants';
import { ERC721CollectionMetadata, ERC721TokenMetadata } from 'src/types/metadata';

@Injectable()
export class BlockchainMetadataFetcherService {
	constructor() {}

	async getCollectionMetadata(baseUri: string): Promise<ERC721CollectionMetadata> {
		const metadata: ERC721CollectionMetadata = await superdaoIPFS.getFile(`${baseUri}/contract`);

		return metadata;
	}

	getCollectionMetadataUri(baseUri: string) {
		return `${this.getSuperdaoIpfsPrefix()}/${baseUri}/contract`;
	}

	async getTierMetadata(baseUri: string, tier: string): Promise<ERC721TokenMetadata> {
		const metadata: ERC721TokenMetadata = await superdaoIPFS.getFile(`${baseUri}/${tier.toUpperCase()}`);

		return metadata;
	}

	getTierMetadataUri(baseUri: string, tier: string) {
		return `${this.getSuperdaoIpfsPrefix()}/${baseUri}/${tier.toUpperCase()}`;
	}

	async getTierWithRandomArtworkMetadata(
		baseUri: string,
		tier: string,
		artworkId: number
	): Promise<ERC721TokenMetadata> {
		const metadata: ERC721TokenMetadata = await superdaoIPFS.getFile(`${baseUri}/${tier.toUpperCase()}/${artworkId}`);

		return metadata;
	}

	getTierWithRandomArtworkMetadataUri(baseUri: string, tier: string, artworkId: number) {
		return `${this.getSuperdaoIpfsPrefix()}/${baseUri}/${tier.toUpperCase()}/${artworkId}`;
	}

	getBaseUriWithoutIpfsPrefix(uriWithIpfs: string) {
		return uriWithIpfs.replace(IPFS_PREFIX, '')?.replace('/', '');
	}

	getSuperdaoIpfsPrefix() {
		return `${config.urls.infuraCacheProxyServerUrl}/ipfs`;
	}
}
