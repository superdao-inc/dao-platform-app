import { IPFS_PREFIX } from 'src/constants';
import { getIpfsUrlByHash } from 'src/entities/contract/utils';

type NftOpenseaMetadata = {
	image: string;
	imageData?: string;
	externalUrl?: string;
	description?: string;
	name?: string;
	attributes: { trait_type: string; value: string }[];
	backgroundColor: string;
	animationUrl?: string;
	youtubeUrl?: string;
};

export const parseNftMetadata = (input: string): NftOpenseaMetadata => {
	const res: NftOpenseaMetadata = JSON.parse(input);

	if (res.image?.startsWith(IPFS_PREFIX)) {
		res.image = getIpfsUrlByHash(res.image);
	}

	if (res.animationUrl?.startsWith(IPFS_PREFIX)) {
		res.animationUrl = getIpfsUrlByHash(res.animationUrl);
	}

	return res;
};
