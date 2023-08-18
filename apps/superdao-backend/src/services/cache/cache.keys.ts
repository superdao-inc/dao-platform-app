// read as suggestion to redis hash functionality with hget, hset and so on...
export const getUserNftsKey = (userAddress: string, daoAddress: string) => ({
	key: `nfts-by-user:${userAddress}`,
	field: daoAddress
});

export const getCollectionsKey = (daoAddress: string) => `collections:${daoAddress}`;

export const getCollectionAddressKey = (daoAddress: string) => `collection-address:${daoAddress}`;

// read as suggestion to redis hash functionality with hget, hset and so on...
export const getCollectionArtworksKey = (daoAddress: string, tier: string) => ({
	key: `collection-artworks:${daoAddress}`,
	field: tier
});

// read as suggestion to redis hash functionality with hget, hset and so on...
export const getCollectionTierKey = (daoAddress: string, tier: string) => ({
	key: `collection-tier:${daoAddress}`,
	field: tier
});

// read as suggestion to redis hash functionality with hget, hset and so on...
export const getSingleNftKey = (daoAddress: string, tokenId: string) => ({
	key: `single-nft:${daoAddress}`,
	field: tokenId
});

export const getIsOpenSaleActiveKey = (daoAddress: string) => `is-open-sale-active:${daoAddress}`;

export const getOpenSaleTokenAddressKey = (daoAddress: string) => `open-sale-token-address:${daoAddress}`;

export const getTreasuryMainWalletAddressKey = (daoAddress: string) => `treasury-main-wallet-address:${daoAddress}`;

export const getNftAdminServiceCollectionKey = (daoAddress: string) => `nft-admin-service-collection:${daoAddress}`;

export const getIsPrivateSaleActiveKey = (daoAddress: string) => `is-private-sale-active:${daoAddress}`;

export const getTierSalesPricesKey = (daoAddress: string, tierIdOrName: string) => ({
	key: `tier-sales-prices:${daoAddress}`,
	field: tierIdOrName
});

export const getIsDaoVerifiedKey = (daoId: string) => `isDaoVerified:${daoId}`;
