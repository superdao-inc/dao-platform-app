import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphQLClient } from 'graphql-request';

import { getSdk } from 'src/gql/codegen/sdk';

@Injectable()
export class GraphClient {
	private readonly logger = new Logger(GraphClient.name);

	private readonly client: GraphQLClient;
	private readonly sdk: ReturnType<typeof getSdk>;

	constructor(private readonly configService: ConfigService) {
		this.client = new GraphQLClient(this.configService.get('polygonGraph').url);
		this.sdk = getSdk(this.client);
	}

	/**
	 * Returns DAO by address
	 * @param id DAO's contract address
	 */
	async dao(id: string) {
		try {
			const response = await this.sdk.getGraphDao({ id });

			this.logger.log(`[GraphClient] dao request success`, { id });

			return response;
		} catch (e) {
			this.logger.log(`[GraphClient] dao request fail`, { id, e });

			throw e;
		}
	}

	async daos(first: number = 100, skip: number = 0) {
		try {
			const response = await this.sdk.getGraphDaos({ first, skip });

			this.logger.log(`[GraphClient] daos request success`, { first, skip });

			return response;
		} catch (e) {
			this.logger.log(`[GraphClient] daos request fail`, { first, skip, e });

			throw e;
		}
	}

	//treasury
	async getDaoTreasury(daoAddress: string) {
		try {
			const response = await this.sdk.getDaoTreasury({ daoAddress });

			this.logger.log(`[GraphClient] getDaoTreasury request success`, { daoAddress });

			return response;
		} catch (e) {
			this.logger.log(`[GraphClient] getDaoTreasury request fail`, { daoAddress, e });

			throw e;
		}
	}

	//membership
	async getDaosAdmins(daoAddresses: string[], limit: number, skip: number) {
		try {
			const response = await this.sdk.getDaosAdmins({
				first: limit,
				skip,
				where: { id_in: daoAddresses }
			});

			this.logger.log(`[GraphClient] getDaosAdmins request success`);

			return response;
		} catch (e) {
			this.logger.log(`[GraphClient] getDaosAdmins request fail`, { daoAddresses, limit, skip, e });

			throw e;
		}
	}

	async getDaoMembersByNfts(daoAddress: string, limit: number, skipNfts: number) {
		try {
			const response = await this.sdk.getDaoMembersByNft({
				firstNfts: limit,
				daoAddress,
				skipNfts
			});

			this.logger.log(`[GraphClient] getDaoMembersByNfts request success`);

			return response;
		} catch (e) {
			this.logger.log(`[GraphClient] getDaoMembersByNfts request fail`, { daoAddress, limit, skipNfts, e });

			throw e;
		}
	}

	async getCollectionNfts(collectionAddress: string, limit: number, skipNfts: number) {
		try {
			const response = await this.sdk.getCollectionNfts({
				collectionId: collectionAddress,
				first: limit,
				skipNfts
			});

			this.logger.log(`[GraphClient] getCollectionNfts request success`);

			return response;
		} catch (e) {
			this.logger.log(`[GraphClient] getCollectionNfts request fail`, {
				collectionAddress,
				limit,
				skipNfts,
				e
			});

			throw e;
		}
	}

	async daoCollection(daoId: string) {
		try {
			const response = await this.sdk.getGraphDaoCollection({ daoId });

			this.logger.log(`[GraphClient] dao collection request success`, { daoId });

			return response;
		} catch (e) {
			this.logger.log(`[GraphClient] dao collection request fail`, { daoId, e });

			throw e;
		}
	}

	async getNftsByDao(daoAddress: string, tierId: string, ownerId: string) {
		try {
			const response = await this.sdk.getGraphDao({ id: daoAddress?.toLowerCase() });
			const collectionId = response?.dao?.collection?.id;

			const nfts = await this.sdk.getGraphNfts({
				where: {
					collection_: { id: collectionId },
					tier_: { nativeID: tierId },
					owner_: { id: ownerId?.toLowerCase() }
				}
			});

			this.logger.log(`[GraphClient] getNfts request success`, { daoAddress, tierId, ownerId });

			return nfts?.nfts;
		} catch (e) {
			this.logger.log(`[GraphClient] getNfts request fail`, { daoAddress, tierId, ownerId, e });

			throw e;
		}
	}

	async daoCollectionNfts(daoId: string) {
		try {
			const response = await this.sdk.getGraphDaoCollectionNfts({ daoId, first: 1000 });

			this.logger.log(`[GraphClient] dao collection nfts request success`, { daoId });

			return response;
		} catch (e) {
			this.logger.log(`[GraphClient] dao collection nfts request fail`, { daoId, e });
		}
	}

	async daoCollectionOwnerNfts(daoId: string, ownerId: string) {
		try {
			const response = await this.sdk.getGraphDaoCollectionOwnerNfts({ daoId, ownerId });

			this.logger.log(`[GraphClient] dao collection owner's nfts request success`, { daoId });

			return response;
		} catch (e) {
			this.logger.log(`[GraphClient] dao collection owner's nfts request fail`, { daoId, e });
		}
	}

	async daoCollectionOwners(daoId: string) {
		try {
			const response = await this.sdk.getGraphDaoCollectionOwners({ daoId });

			this.logger.log(`[GraphClient] dao collection owners request success`, { daoId });

			return response;
		} catch (e) {
			this.logger.log(`[GraphClient] dao collection owners request fail`, { daoId, e });
		}
	}
}
