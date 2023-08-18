import { ethers } from 'ethers';
import { SaleConfig } from 'src/entities/nftAdmin/nftAdmin.types';
import {
	TIER_EXTRA_ARTWORKS_NUM,
	DEACTIVATED,
	IS_TRANSFERABLE,
	MAX_AMOUNT,
	NAME,
	POLYGON_ADDRESS_MAP,
	TIER_RANDOM_MINT,
	TIER_RANDOM_SHUFFLE_MINT,
	TRANSFER_UNLOCKS_AT_HOURS,
	WEEK_IN_MILLISECONDS
} from '@sd/superdao-shared';

export const TIER_ATTRS_TO_REMOVE = [
	NAME,
	MAX_AMOUNT,
	IS_TRANSFERABLE,
	TRANSFER_UNLOCKS_AT_HOURS,
	TIER_RANDOM_MINT,
	TIER_RANDOM_SHUFFLE_MINT,
	TIER_EXTRA_ARTWORKS_NUM,
	DEACTIVATED
];

export const defaultDeployOptions: SaleConfig = {
	prices: [],
	isActive: false,
	token: POLYGON_ADDRESS_MAP.MATIC.address,
	treasuryWallet: ethers.constants.AddressZero,
	timeStart: new Date().getTime(),
	timeEnd: new Date().getTime() + WEEK_IN_MILLISECONDS,
	totalClaimsLimit: 0,
	claimLimit: 0
};
