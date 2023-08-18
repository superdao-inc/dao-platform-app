import { BigNumber } from 'ethers';
import { ERC721Properties } from 'src/typechain';
import { ExtendedNftTier } from '../nftAdmin.types';
import { ERC721HelperService } from 'src/entities/contract/erc721Helper.service';

export const setterValues = {
	artworksCount: 'artworksCount',
	maxAmount: 'maxAmount',
	setRandom: 'setRandom',
	removeRandom: 'removeRandom',
	setRandomShuffle: 'setRandomShuffle',
	removeRandomShuffle: 'removeRandomShuffle'
};

export const getErc721BaseMock = (beforeTiers: ExtendedNftTier[]) => {
	const getTier = (tierId: string) => beforeTiers?.find(({ id }) => tierId === id)!;

	return {
		getMaxAmount: async (_: ERC721Properties, tierId: string) => {
			const tier = getTier(tierId);

			return BigNumber.from(tier?.maxAmount);
		},
		isRandom: async (_: ERC721Properties, tierId: string) => {
			const tier = getTier(tierId);

			return tier?.isRandom;
		},
		isRandomWrong: async (_: ERC721Properties, tierId: string) => {
			const tier = getTier(tierId);

			return (tier as ExtendedNftTier & { isRandomWrong: boolean })?.isRandomWrong;
		},
		hasRandomShuffleMint: async (_: ERC721Properties, tierId: string) => {
			const tier = getTier(tierId);

			return tier?.hasRandomShuffleMint;
		},
		hasRandomShuffleMintWrong: async (_: ERC721Properties, tierId: string) => {
			const tier = getTier(tierId);

			return (tier as ExtendedNftTier & { hasRandomShuffleMintWrong: boolean })?.hasRandomShuffleMintWrong;
		},
		getArtworksCount: async (_: ERC721Properties, tierId: string) => {
			const tier = getTier(tierId);

			return tier?.artworks?.length;
		},
		setMaxAmount: async (_: ERC721Properties, tierId: string, __: BigNumber) => {
			return {
				to: '',
				from: tierId,
				data: setterValues.maxAmount
			};
		},
		setArtworksCount: async (_: ERC721Properties, tierId: string, __: number) => {
			return {
				to: '',
				from: tierId,
				data: setterValues.artworksCount
			};
		},
		setRandom: async (_: ERC721Properties, tierId: string, value: boolean, __: BigNumber, ___: number) => {
			return {
				to: '',
				from: tierId,
				data: value ? setterValues.setRandom : setterValues.removeRandom
			};
		},
		setRandomShuffleMint: async (_: ERC721Properties, tierId: string, value: boolean, __: BigNumber) => {
			return {
				to: '',
				from: tierId,
				data: value ? setterValues.setRandomShuffle : setterValues.removeRandomShuffle
			};
		}
	} as ERC721HelperService;
};
