import { ArtworkType } from './types';
import { config } from 'src/config';
import { NftMetadata } from 'src/entities/nft/nft.types';

const {
	urls: { infuraCacheProxyServerUrl }
} = config;
const ipfsPartUrlRegEx = /\/ipfs\/[^&]*/g;

export const mapArtworks = <T>(data: T): T => {
	return mutateObject<T>(data, 'artworks', updateArtworksArray);
};

export const mapMetadata = <T>(data: T): T => {
	return mutateObject<T>(data, 'metadata', updateMetadata);
};

function updateArtworksArray(artworks: ArtworkType[]): ArtworkType[] {
	return artworks.map(updateArtwork);
}

export function updateArtwork(artwork: ArtworkType): ArtworkType {
	const imageIpfsUrl = artwork.image.match(ipfsPartUrlRegEx);
	const animationIpfsUrl = artwork.animationUrl?.match(ipfsPartUrlRegEx);

	return {
		...artwork,
		image: imageIpfsUrl ? `${infuraCacheProxyServerUrl}${imageIpfsUrl[0]}` : artwork.image,
		animationUrl: animationIpfsUrl ? `${infuraCacheProxyServerUrl}${animationIpfsUrl[0]}` : artwork.animationUrl
	};
}

function updateMetadata(metadata: NftMetadata): NftMetadata {
	if (!metadata) {
		return metadata;
	}

	const ipfsUrl = metadata.image.match(ipfsPartUrlRegEx);

	return {
		...metadata,
		image: ipfsUrl ? `${infuraCacheProxyServerUrl}${ipfsUrl[0]}` : metadata.image
	};
}

/**
 * @TODO
 * Вынести в какой-нибудь отдельный helper или типо того, возможно в shared
 */
function mutateObject<T>(initialObject: T, mutableKey: string, mapFunction: Function): T {
	if (!initialObject) {
		return initialObject;
	}

	const updatedObject: any = initialObject;

	try {
		Object.keys(initialObject).forEach((key: string) => {
			if (key === mutableKey) {
				updatedObject[key] = mapFunction(updatedObject[key]);
			} else if (key !== mutableKey && typeof updatedObject[key] === 'object') {
				mutateObject(updatedObject[key], mutableKey, mapFunction);
			}
		});
	} catch (e) {
		return initialObject;
	}

	return updatedObject;
}
