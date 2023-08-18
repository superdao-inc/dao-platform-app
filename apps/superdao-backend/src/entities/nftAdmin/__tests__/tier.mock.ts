// MOCKED TYPE
enum TierArtworkTypeStrings {
	one = 'one', // when there is 1 artwork, for example, there are only 1000 units, and all are the same
	reveal = 'reveal', // when you don't know what artwork is, you buy a pig in a poke
	unique = 'unique', // when there are many artworks, like random, only the user can choose which one to buy
	random = 'random' // when there are a lot of artworks, and when buying they are randomized, you don't know which one will fall out
}

export const tierMock = {
	maxAmount: 2,
	artworks: [],
	hasRandomShuffleMint: false,
	isRandom: false,
	isRandomWrong: false,
	hasRandomShuffleMintWrong: false,
	isTransferable: false,
	transferUnlockDate: 1,
	isDeactivated: false,
	tierName: 'Test name',
	description: 'Short description',
	artworksTotalLength: 10,
	currency: 'MATIC',
	totalPrice: {
		openSale: '0000',
		whitelistSale: '0000'
	},
	tierArtworkType: TierArtworkTypeStrings.one,
	totalAmount: 0,
	achievements: [],
	benefits: [],
	customProperties: [],
	salesActivity: {
		openSale: true,
		whitelistSale: true
	}
};
