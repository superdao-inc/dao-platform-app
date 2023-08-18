import { components } from 'moralis/types/generated/web3Api';
import { NftInfo, NftOpenseaMetadata, NftOpenseaMetadataAttribute } from '../../entities/walletNfts/walletNfts.model';
import { config } from 'src/config';
import { WalletNft } from 'src/services/nfts-provider/nfts-provider.types';

const httpsImageRegEx = /^https?:\/\//;
const ipfsImageRegEx = /^ipfs?:\/\//;
const ipfsProtocolUrlRegEx = /\/ipfs\/[^&]*/g;
/**
 * @see https://docs.opensea.io/docs/metadata-standards#attributes
 */
// const openseaMetadataAttributeSchema = z.object({
// 	display_type: z.string().optional(),
// 	trait_type: z.string(),
// 	value: z.string()
// });

/**
 * @see https://docs.opensea.io/docs/metadata-standards#metadata-structure
 */
// const openseaMetadataSchema = z.object({
// 	name: z.string().optional().nullable(),
// 	image: z.string().optional().nullable(),
// 	external_url: z.string().optional().nullable(),
// 	description: z.string().optional().nullable(),
// 	animation_url: z.string().optional().nullable(),
// 	youtube_url: z.string().optional().nullable(),
// 	background_color: z.string().optional().nullable(),
// 	attributes: z.array(openseaMetadataAttributeSchema).optional().nullable()
// });

class NftOpenseaMetadataAttributeRaw {
	display_type?: string;
	sd_trait?: string;
	trait_type: string;
	value: string;
}

export class NftsMapper {
	/**
	 * @deprecated
	 */
	public static mapMoralisNft(nft: components['schemas']['nftOwner']): NftInfo {
		const model = new NftInfo();

		model.id = nft.token_id;
		model.tokenAddress = nft.token_address;
		model.tokenId = nft.token_id;
		model.contractType = nft.contract_type;
		model.ownerOf = nft.owner_of;
		model.blockNumber = nft.block_number;
		model.blockNumberMinted = nft.block_number_minted;
		model.tokenUri = nft.token_uri;
		model.syncedAt = nft.synced_at;
		model.amount = nft.amount;
		model.name = nft.name;
		model.symbol = nft.symbol;
		model.isPublic = true;
		model.metadata = NftsMapper.mapOpenseaMetadata(nft.metadata);

		return model;
	}

	public static mapNftInfo(nft: WalletNft): NftInfo {
		const model = new NftInfo();

		model.id = nft.id;
		model.tokenAddress = nft.tokenAddress;
		model.tokenId = nft.tokenId;
		model.contractType = nft.contractType;
		model.ownerOf = nft.ownerOf;
		model.blockNumber = nft.blockNumber;
		model.blockNumberMinted = nft.blockNumberMinted;
		model.tokenUri = nft.tokenUri;
		model.syncedAt = nft.syncedAt;
		model.amount = nft.amount;
		model.name = nft.name;
		model.symbol = nft.symbol;
		model.isPublic = nft.isPublic;
		model.metadata = NftsMapper.mapOpenseaMetadata(nft.metadata);

		return model;
	}

	private static mapOpenseaMetadata(metadata?: string): NftOpenseaMetadata | undefined {
		if (!metadata) return undefined;

		const json = JSON.parse(metadata);
		//if (!openseaMetadataSchema.safeParse(json).success) return undefined;
		const model = new NftOpenseaMetadata();

		model.image = this.mapImageUrl(json.image);
		model.externalUrl = json.external_url;
		model.description = json.description;
		model.name = json.name;
		model.animationUrl = this.mapImageUrl(json.animation_url);
		model.youtubeUrl = json.youtube_url;
		model.backgroundColor = json.background_color;

		if (Array.isArray(json.attributes)) {
			const attributes = json.attributes as NftOpenseaMetadataAttributeRaw[];
			model.attributes = attributes
				.map((a) => this.mapOpenseaMetadataAttribute(a))
				.filter((a) => a !== undefined) as NftOpenseaMetadataAttribute[];
		}

		return model;
	}

	private static mapOpenseaMetadataAttribute(
		attribute: NftOpenseaMetadataAttributeRaw
	): NftOpenseaMetadataAttribute | undefined {
		if (!attribute) return undefined;

		const model = new NftOpenseaMetadataAttribute();

		model.displayType = attribute.display_type;
		model.sdTrait = attribute.sd_trait;
		model.traitType = attribute.trait_type;
		model.value = attribute.value;

		return model;
	}

	private static mapImageUrl(ipfsImageUrl?: string) {
		if (!ipfsImageUrl) return '';

		const ipfsImageHttps = ipfsImageUrl.match(httpsImageRegEx);
		if (ipfsImageHttps) return ipfsImageUrl;

		const ipfsImageIpfs = ipfsImageUrl.match(ipfsImageRegEx);
		if (ipfsImageIpfs) {
			const id = ipfsImageUrl.replace('ipfs://', '/ipfs/');
			return `${config.urls.infuraCacheProxyServerUrl}${id}`;
		}

		const ipfsImage = ipfsImageUrl.match(ipfsProtocolUrlRegEx);
		return ipfsImage ? `${config.urls.infuraCacheProxyServerUrl}${ipfsImage[0]}` : '';
	}
}
