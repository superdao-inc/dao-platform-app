import { ethers } from 'ethers';
import { v4 } from 'uuid';
import { UNLIMITED_MAX_AMOUNT_VALUE } from 'src/constants';
import { POLYGON_ADDRESS_MAP } from '@sd/superdao-shared';
import {
	ExtendedNftTier,
	TierArtworkTypeStrings,
	NftAdminUpdateCollectionTxInput,
	NftMetadata,
	ExtendedNftTierInput,
	MultiTypeNftAttributeInput,
	NftTier
} from 'src/types/types.generated';
import { ipfsService } from 'src/services/ipfs';
import { DEFAULT_TIER_ID } from 'src/pagesComponents/dao/nftEdit/constants';

export const getTierCurrency = (tier?: NftTier, isPublicSale: boolean = true): keyof typeof POLYGON_ADDRESS_MAP => {
	if (!isPublicSale) return 'MATIC';

	return (tier?.currency?.length ? tier?.currency : 'MATIC') as keyof typeof POLYGON_ADDRESS_MAP;
};

export const getTierPrice = (tier: NftTier, isPublicSale: boolean): number | null => {
	if (!tier.totalPrice) return null;

	const value = isPublicSale ? tier.totalPrice?.openSale : tier.totalPrice?.whitelistSale;

	const token = getTierCurrency(tier, isPublicSale);

	return value?.length ? Number(ethers.utils.formatUnits(value, POLYGON_ADDRESS_MAP[token].decimals)) : null;
};

export const getDefaultTierObject = (): NftAdminUpdateCollectionTxInput['tiers'][number] => ({
	id: DEFAULT_TIER_ID,
	artworks: [],
	isDeactivated: false,
	artworksTotalLength: 0,
	isRandom: false,
	hasRandomShuffleMint: false,
	isTransferable: false,
	maxAmount: UNLIMITED_MAX_AMOUNT_VALUE,
	totalAmount: 0,
	tierArtworkType: TierArtworkTypeStrings.One,
	transferUnlockDate: new Date().getTime(),
	achievements: [],
	benefits: [],
	customProperties: [],
	salesActivity: {
		openSale: false,
		whitelistSale: false
	}
});

export const getTierConfigDraft = ({
	tierId,
	daoAddress,
	collectionAddress
}: {
	tierId: string;
	daoAddress: string;
	collectionAddress: string;
}): NftAdminUpdateCollectionTxInput['tierConfigs'][number] => ({
	id: v4(),
	tierId,
	daoAddress,
	collectionAddress,
	isHidden: false,
	position: 100
});

export const urlToIpfsHash = (url?: string) => {
	if (!url) return '';
	if (url.startsWith('ipfs://')) return url;

	const ipfsHash = url.split('/ipfs/').at(-1);
	if (!ipfsHash) return url;

	return `ipfs://${ipfsHash}`;
};

export const urlObjectToFile = async (file: string, name: string) =>
	await fetch(file)
		.then((r) => r.blob())
		.then((blobFile) => new File([blobFile], name));

export const uploadBlobArtworks = async (tier: ExtendedNftTier) => {
	const queue = tier.artworks.map(async (artwork: NftMetadata) => {
		if (artwork.image?.startsWith('blob:'))
			artwork.image = await ipfsService.pushFileAndGetUri(
				await urlObjectToFile(artwork.image, artwork.imageName || 'unnamed')
			);

		if (artwork.animationUrl?.startsWith('blob:'))
			artwork.animationUrl = await ipfsService.pushFileAndGetUri(
				await urlObjectToFile(artwork.animationUrl, artwork.animationUrlName || 'unnamed')
			);
	});

	for (const promise of queue) {
		await promise;
	}
};

const filterFunc = (attr: MultiTypeNftAttributeInput) =>
	(typeof attr.valueString === 'string' && attr.valueString && attr.valueString.trim()) ||
	(typeof attr.valueNumber === 'number' && attr.valueNumber);

export const filterAttributes = (tiers: ExtendedNftTierInput[] = []) => {
	return tiers.map((tier) => {
		return {
			...tier,
			achievements: tier.achievements.filter(filterFunc),
			benefits: tier.benefits.filter(filterFunc),
			customProperties: tier.customProperties.filter(filterFunc)
		};
	});
};
