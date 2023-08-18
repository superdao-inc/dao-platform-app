import { PopulatedTransaction, BigNumber } from 'ethers';
import { ERC721Properties } from 'src/typechain';
import { ExtendedNftTier } from './nftAdmin.types';
import { ERC721HelperService } from '../contract/erc721Helper.service';

type Props = {
	erc721Contract: ERC721Properties;
	erc721Base: ERC721HelperService;
	tier: ExtendedNftTier;
};

export const generateSpecificRandomTransactions = async ({ erc721Base, erc721Contract, tier }: Props) => {
	const transactions: PopulatedTransaction[] = [];
	const descriptions: string[] = [];

	const [
		maxAmount,
		isPrevRandom,
		isPrevRandomWrong,
		isPrevRandomShuffleMint,
		isPrevRandomShuffleMintWrong,
		artworkCount
	] = await Promise.all([
		erc721Base.getMaxAmount(erc721Contract, tier.id),
		erc721Base.isRandom(erc721Contract, tier.id),
		erc721Base.isRandomWrong(erc721Contract, tier.id),
		erc721Base.hasRandomShuffleMint(erc721Contract, tier.id),
		erc721Base.hasRandomShuffleMintWrong(erc721Contract, tier.id),
		erc721Base.getArtworksCount(erc721Contract, tier.id)
	]);

	const { isRandom: isNextRandom, hasRandomShuffleMint: isNextRandomShuffleMint } = tier;

	// When setting the random and shuffle, the value is set to N - 1.
	const tierArtworksSize = tier.artworks.length - 1 < 0 ? tier.artworks.length : tier.artworks.length - 1;
	const imagesSize = isNextRandom || isNextRandomShuffleMint ? tierArtworksSize : tier.artworks.length;
	const isNewArtworksCount = imagesSize !== artworkCount;
	const tierMaxAmount = BigNumber.from(tier.maxAmount);
	const isNewMaxAmount = !tierMaxAmount.eq(maxAmount);

	const isDifferentRandom = isNextRandom !== isPrevRandom;
	const isDifferentShuffle = isNextRandomShuffleMint !== isPrevRandomShuffleMint;
	const removeRandom =
		// If the shooting range was randomly enabled earlier, and the next random is also enabled and the shuffle is on, you need to turn it off randomly
		(isPrevRandom && isNextRandom && isNextRandomShuffleMint) ||
		// When we turn off randomly
		(isDifferentRandom && !isNextRandom) ||
		// When random number or artwork is changed for random (we need to turn off random to turn it back on)
		(isPrevRandom && isNextRandom && (isNewMaxAmount || isNewArtworksCount)) ||
		// When the random was set incorrectly, but for some reason we did not update this shooting range
		(isNextRandom && isPrevRandomWrong);
	const removeShuffle =
		// When we want to turn off the shuffle
		(isDifferentShuffle && !isNextRandomShuffleMint) ||
		// When shuffle range changes quantity (we need to turn it off to turn shuffle back on)
		(isPrevRandomShuffleMint && isNextRandomShuffleMint && isNewMaxAmount) ||
		// When the shuffle was set incorrectly, but for some reason we did not update the shooting range earlier
		(isNextRandomShuffleMint && isPrevRandomShuffleMintWrong);
	// to enable random and shuffle, the conditions above apply
	const setRandom =
		(isDifferentRandom && isNextRandom) ||
		(isNextRandom && (isNewMaxAmount || isNewArtworksCount)) ||
		(isNextRandom && isPrevRandomWrong);
	const setShuffle =
		(isDifferentShuffle && isNextRandomShuffleMint) ||
		(isNextRandomShuffleMint && isNewMaxAmount) ||
		(isNextRandomShuffleMint && isPrevRandomShuffleMintWrong);

	// When changing the quantity, provided that the shooting range has a random, skip this action
	if (isNewMaxAmount && !isNextRandom && !isNextRandomShuffleMint) {
		const tx = await erc721Base.setMaxAmount(erc721Contract, tier.id, tierMaxAmount);
		transactions.push(tx);
		descriptions.push('Set max amount');
	}

	// When changing artworks, provided that the tier is random, skip this action
	if (isNewArtworksCount && !isNextRandom && !isNextRandomShuffleMint) {
		const count = tier.artworks.length <= 1 ? 0 : tier.artworks.length;
		const tx = await erc721Base.setArtworksCount(erc721Contract, tier.id, count);
		transactions.push(tx);
		descriptions.push(`Set tier artworks count to ${count}`);
	}

	// Removing a random or shuffle may not be explicit when changing the maxAmount/artworksCount fields
	if (removeRandom || (setShuffle && setRandom)) {
		const tx = await erc721Base.setRandom(erc721Contract, tier.id, false, tierMaxAmount, tier.artworks.length);
		transactions.push(tx);
		descriptions.push('Remove tier random type to false');
	}

	if (removeShuffle) {
		const tx = await erc721Base.setRandomShuffleMint(erc721Contract, tier.id, false, tierMaxAmount);
		transactions.push(tx);
		descriptions.push('Remove random shuffle mint to false');
	}

	// If we can include both random and shuffle, then we give preference to shuffle.
	if (setRandom && !setShuffle) {
		const tx = await erc721Base.setRandom(erc721Contract, tier.id, isNextRandom, tierMaxAmount, tier.artworks.length);
		transactions.push(tx);
		descriptions.push(`Set tier random type to ${tier.isRandom}`);
	}

	if (setShuffle || (setShuffle && setRandom)) {
		const tx = await erc721Base.setRandomShuffleMint(erc721Contract, tier.id, isNextRandomShuffleMint, tierMaxAmount);
		transactions.push(tx);
		descriptions.push(`Set random shuffle mint to ${isNextRandomShuffleMint}`);
	}

	return {
		transactions,
		descriptions
	};
};
