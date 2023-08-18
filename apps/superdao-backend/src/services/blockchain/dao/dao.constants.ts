import { ethers } from 'ethers';

import {
	getDefaultTiersForClaim,
	defaultTierPriceBigNum,
	defaultTiers,
	POLYGON_ADDRESS_MAP
} from '@sd/superdao-shared';

import { config } from 'src/config';

const { releaseManagerProxy } = config.polygon;

export const defaultAdminSettings = {
	releaseManager: releaseManagerProxy
};

export const defaultNftSettings = {
	url: `ipfs://QmPda5p5TSaAtEDRVeDyJqRqyUHmjCSFVfkP7r31hvrWwy/`,
	name: 'DAO membership collection',
	symbol: 'DAO membership collection',
	attributes: getDefaultTiersForClaim()
};

export const defaultOpenSaleSettings = {
	tiersValues: Object.keys(defaultTiers).map(ethers.utils.formatBytes32String),
	tiersPrices: Object.keys(defaultTiers).map(() => defaultTierPriceBigNum),
	claimLimit: 0,
	tokenSaleAddress: POLYGON_ADDRESS_MAP.MATIC.address
};

export const defaultWhitelistSaleSettings = {
	tiersValues: [],
	tiersPrices: [],
	claimLimit: 0,
	tokenSaleAddress: ethers.constants.AddressZero
};
