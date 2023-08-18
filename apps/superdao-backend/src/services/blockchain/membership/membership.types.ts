import { NftOwner, ParsedData } from 'src/entities/nft/nft.types';

export interface GetDaosMembersRequest {
	daoAddresses: string[];
}

export interface MembersByAddressEntry {
	[address: string]: string[];
}

export interface MembersWithNftData {
	[daoAddress: string]: ParsedData<NftOwner>[];
}

export interface StringMap {
	[key: string]: string;
}

export interface TransformedGraphDeprecatedDaosMembersResponse {
	[daoAddress: string]: { address: string; nfts: GraphNft[] }[];
}

export interface NftWithMetadataEntry {
	[key: string]: string | number | null | undefined;
}

export interface GraphNft {
	tokenID: string;
	tier: any; // Tier type
	owner: {
		address: string;
		nft: any; //this
	};
	artworkID: number;
	transferredAt: string;
	collection: {
		id: string;
	};
}
