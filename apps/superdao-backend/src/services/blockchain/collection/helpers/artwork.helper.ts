import { Injectable, Logger } from '@nestjs/common';

// services
import { MetadataFetcher } from 'src/entities/contract/metadataFetcher';
import { infuraService } from 'src/blockchain/services/infura';

// utils
import { getIpfsUrlByHash } from 'src/entities/contract/utils';
import { isAddress } from 'ethers/lib/utils';

// exceptions
import { assertNotValid } from 'src/exceptions/assert';

// types
import { Artwork, TierArtworkResponse } from 'src/services/blockchain/collection/collection.types';

@Injectable()
export class BlockchainArtworkHelper {
	private readonly logger = new Logger(BlockchainArtworkHelper.name);

	/**
	 * default artwork id for tier with type one
	 * @private
	 */
	private readonly DEFAULT_TYPE_ONE_ID = '0';

	/**
	 * Get IPFS hash url by hash
	 * @param hash ipfs hash
	 * @private
	 */
	private getIpfsUrlByHash(hash: string | null | undefined): string {
		return hash ? getIpfsUrlByHash(hash) : '';
	}

	/**
	 * Validate the params for the getArtworks methods
	 * @param daoAddress kernel address, ie: 0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2
	 * @param tierId tier id, ie: DFA62D50D0C146139BA5A8296A961C0
	 */
	validateGetArtworksParams(daoAddress: string, tierId: string) {
		assertNotValid(tierId, 'tierId is required');
		assertNotValid(isAddress(daoAddress), 'daoAddress is not a valid address');
	}

	/**
	 * Get the artworks for a tier with random type
	 * @param tierId tier id, ie: DFA62D50D0C146139BA5A8296A961C0
	 * @param metadataFetcher ipfs metadata fetcher
	 * @param maxArtworks max artworks to return
	 */
	async getRandomArtworkType(
		tierId: string,
		metadataFetcher: MetadataFetcher,
		maxArtworks: number
	): Promise<TierArtworkResponse> {
		const artworks: Artwork[] = [];

		const baseURI = metadataFetcher.getBaseURI();
		const cid = baseURI.replace('ipfs://', '');
		const dagCid = `${cid}/${tierId}`;

		try {
			const tierMetadataDagInfo = await infuraService.getDagInfo(dagCid);

			let size = tierMetadataDagInfo.Links.length;
			if (maxArtworks > 0) size = Math.min(tierMetadataDagInfo.Links.length, maxArtworks);

			const links = tierMetadataDagInfo.Links.slice(0, size);
			const files = await Promise.all(links.map((num) => metadataFetcher.getTierFile(tierId, num.Name)));
			const description = files[0]?.description || '';

			for (const metadata of files) {
				const { image, animation_url, attributes } = metadata;

				artworks.push({
					id: artworks.length.toString(),
					imageOriginal: image,
					image: this.getIpfsUrlByHash(image),
					animationUrl: this.getIpfsUrlByHash(animation_url),
					attributes
				});
			}

			return { artworks, artworksTotalLength: tierMetadataDagInfo.Links.length, description };
		} catch (e) {
			this.logger.error('[getRandomArtworkType] error', e);
			throw e;
		}
	}

	/**
	 * Get the artworks for a tier with one type
	 * @param tierId tier id, ie: DFA62D50D0C146139BA5A8296A961C0
	 * @param metadataFetcher ipfs metadata fetcher
	 */
	async getTierArtworkTypeOne(tierId: string, metadataFetcher: MetadataFetcher): Promise<TierArtworkResponse> {
		const ipfsData = await metadataFetcher.getTierMetadata(tierId);
		const { image, animation_url, description: metadataDescription, attributes } = ipfsData;

		const description = metadataDescription || '';
		const artwork = {
			id: this.DEFAULT_TYPE_ONE_ID,
			image: this.getIpfsUrlByHash(image),
			imageOriginal: image,
			animationUrl: this.getIpfsUrlByHash(animation_url),
			attributes
		};

		return { artworks: [artwork], artworksTotalLength: 1, description };
	}
}
