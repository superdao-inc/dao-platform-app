import { PopulatedTransaction } from 'ethers';
import { describe } from '@jest/globals';
import { ERC721Properties } from 'src/typechain';
import { generateSpecificRandomTransactions } from '../nftAdmin.helper';
import { ExtendedNftTier } from '../nftAdmin.types';
import { getErc721BaseMock, setterValues } from './erc721Base.mock';
import { tierMock } from './tier.mock';

const beforeTier1 = {
	...tierMock,
	id: 'test-1'
} as ExtendedNftTier;

const beforeTier2 = {
	...tierMock,
	id: 'test-2',
	maxAmount: 1
} as ExtendedNftTier;

const beforeTier3 = {
	...tierMock,
	id: 'test-3',
	hasRandomShuffleMint: true
} as ExtendedNftTier;

const beforeTier4 = {
	...tierMock,
	id: 'test-4',
	hasRandomShuffleMintWrong: true
} as ExtendedNftTier & { hasRandomShuffleMintWrong: boolean };

const beforeTier5 = {
	...tierMock,
	id: 'test-5',
	hasRandomShuffleMint: true,
	isRandom: true
} as ExtendedNftTier;

const beforeTier6 = {
	...tierMock,
	id: 'test-6',
	artworks: [
		{
			id: '1',
			image: '1',
			description: '123',
			attributes: []
		},
		{
			id: '1',
			image: '1',
			description: '123',
			attributes: []
		}
	],
	isRandom: true
} as ExtendedNftTier;

const beforeTiers = [beforeTier1, beforeTier2, beforeTier3, beforeTier4, beforeTier5, beforeTier6];
const newTiersMap = [
	{
		maxAmount: 3
	},
	{
		maxAmount: 3,
		hasRandomShuffleMint: true
	},
	{
		hasRandomShuffleMint: false,
		isRandom: true
	},
	{
		hasRandomShuffleMint: true
	},
	{
		hasRandomShuffleMint: true,
		isRandom: true
	},
	{
		isRandom: false,
		artworks: [beforeTier6?.artworks?.[0]]
	}
];

const newTiers = beforeTiers?.map((tier, index) => ({
	...tier,
	...(newTiersMap?.[index] ? newTiersMap?.[index] : {})
}));
const expectedTransactions = [
	setterValues.maxAmount,
	setterValues.setRandomShuffle,
	setterValues.removeRandomShuffle,
	setterValues.setRandom,
	setterValues.removeRandomShuffle,
	setterValues.setRandomShuffle,
	setterValues.removeRandom,
	setterValues.artworksCount,
	setterValues.removeRandom
];

const erc721BaseMock = getErc721BaseMock(beforeTiers);
const erc721ContractMock = {} as ERC721Properties;

describe('nftAdmin helpers', () => {
	it('should generate specific random transactions', async () => {
		const transactions: PopulatedTransaction[] = [];

		for await (const tier of newTiers as ExtendedNftTier[]) {
			const { transactions: txs = [] } = await generateSpecificRandomTransactions({
				erc721Base: erc721BaseMock,
				erc721Contract: erc721ContractMock,
				tier
			});

			transactions.push(...txs);
		}

		expect(transactions?.map((tx) => tx.data)).toEqual(expectedTransactions);
	});
});
