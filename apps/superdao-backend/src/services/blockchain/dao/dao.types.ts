export interface GetDeployDefaultDaoTxRequest {
	adminAdresses: string[];
	openseaOwnerAddress: string;
	creatorAddress: string;
}

export interface GetDeployedByTxDaoAddressRequest {
	txHash: string;
}
