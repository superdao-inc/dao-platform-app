import { ChainId } from 'src/types/types.generated';

export const MAX_PUBLIC_NFTS_COUNT = 21;

export const networkMap: Record<string, number> = {
	[ChainId.PolygonMainnet]: 137,
	[ChainId.EthereumMainnet]: 1
};

// safeTransferFrom(address,address,uint256)
export const SAFE_TRANSFER_FROM_WITHOUT_DATA_HASH = '42842e0e';

export const EMPTY_DATA = '0x';
