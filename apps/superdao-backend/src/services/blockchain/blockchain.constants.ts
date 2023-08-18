import { ethers } from 'ethers';

import { provider } from 'src/config';

export const wallet = new ethers.Wallet('0x0000000000000000000000000000000000000000000000000000000000000001', provider);

export const deprecatedDaos = [
	'0x0e6ce0a6659d93f752bb73dad91f449a4cb4201a',
	'0x5d133b00a089d25f3fb48d15fd0ed786aaac056e',
	'0x8fb737dc6847fbdd029b5d3442d2ea0a5ce9a652',
	'0xa6a801501578986f9530455e71fd36b372271df9'
];

export enum CONTRACT_NAME {
	// Apps
	ADMIN = 'ADMIN',
	ERC721 = 'ERC721',
	ERC721_OPEN_SALE = 'ERC721_OPEN_SALE',
	ERC721_WHITELIST_SALE = 'ERC721_WHITELIST_SALE',
	ERC721_WHITELIST_CLAIM = 'ERC721_WHITELIST_CLAIM',

	// Infrastructure
	KERNEL = 'KERNEL',
	DAO_COSTRUCTOR = 'DAO_COSTRUCTOR',
	WALLET = 'WALLET'
}
