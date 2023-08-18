import { Injectable, Logger } from '@nestjs/common';
import { isAddress } from 'ethers/lib/utils';
import keyBy from 'lodash/keyBy';
import pLimit from 'p-limit';

import { ForbiddenError } from 'src/exceptions';
import { GetDaoMembersByNftQuery, GetDaosAdminsQuery } from 'src/gql/codegen/sdk';
import { DaosMembersByNftData } from 'src/entities/nft/nft.types';
import { GraphClient } from 'src/services/the-graph/graph-polygon/graph.client';

import { MembersByAddressEntry } from './membership.types';
import { DEFAULT_QUERY_LIMIT, MAX_GRAPH_CONCURRENT_REQUETS_COUNT } from './membership.constants';

import { deprecatedDaos } from '../blockchain.constants';
import { BlockchainAdminContractService } from '../contracts/admin/admin.service';
import { BlockchainERC721ContractService } from '../contracts/erc721/erc721.service';

@Injectable()
export class BlockchainMembershipHelper {
	private readonly logger = new Logger(BlockchainMembershipHelper.name);

	constructor(
		private readonly blockchainAdminContractService: BlockchainAdminContractService,
		private readonly blockchainERC721ContractService: BlockchainERC721ContractService,
		private readonly graphClient: GraphClient
	) {}

	public validateDaoAdresses(daoAddresses: string[]) {
		const validAddresses = daoAddresses.filter(isAddress);
		if (!validAddresses?.length) {
			this.logger.error('[BlockchainMembershipService] list of addresses is not valid', { daoAddresses });
			throw new ForbiddenError('No valid dao addresses found');
		}

		return validAddresses;
	}

	public separateDaoAdresses(daoAddresses: string[]) {
		const loweredDeprecatedAddresses = deprecatedDaos.map((address) => address.toLowerCase());

		return {
			deprecatedAddresses: daoAddresses.filter((address) => loweredDeprecatedAddresses.includes(address)),
			actualAddresses: daoAddresses.filter((address) => !loweredDeprecatedAddresses.includes(address))
		};
	}

	public transformGraphDaosAdminsResponse(graphDaosAdminsResponse: GetDaosAdminsQuery['daos']) {
		return graphDaosAdminsResponse.reduce(
			(acc, dao) => Object.assign(acc, { [dao.id]: dao.controller.admins.map((a) => a.user?.id).filter(Boolean) }),
			{} as { [address: string]: string[] }
		);
	}

	public async getDaosAdmins(daoAddresses: string[]) {
		const limit = DEFAULT_QUERY_LIMIT;
		let skip = 0;

		let daos: GetDaosAdminsQuery['daos'] = [];

		try {
			while (true) {
				const graphResponse = await this.graphClient.getDaosAdmins(daoAddresses, limit, skip);

				daos.push(...graphResponse.daos);

				if (graphResponse.daos.length < limit) break;

				skip += limit;
			}

			const admins = this.transformGraphDaosAdminsResponse(daos);

			return admins;
		} catch (e) {
			this.logger.log(`getDaosAdmins request fail`, { daoAddresses, e });
		}
	}

	public async getDeprecatedDaosAdmins(deprecatedAddresses: string[]) {
		let adminsByDeprecatedAddresses: MembersByAddressEntry = {};

		if (deprecatedAddresses.length) {
			await Promise.all(
				deprecatedAddresses.map(async (daoAddress) => {
					const adminAddress = await this.blockchainAdminContractService.getAppAddress({ daoAddress });

					const adminContract = await this.blockchainAdminContractService.getAdminContract({
						adminAddress
					});

					try {
						const admins = await adminContract.adminAddresses();

						adminsByDeprecatedAddresses[daoAddress] = admins;
					} catch (e) {}
				})
			);
		}

		return adminsByDeprecatedAddresses;
	}

	public transformNftsToMembershipData(
		defaultValue: DaosMembersByNftData['daoAddress'],
		collection: GetDaoMembersByNftQuery['daos'][0]['collection'] | null | undefined
	) {
		if (!collection?.nfts?.length) return [];

		const membersAccumulator: Record<string, DaosMembersByNftData['daoAddress'][0]> = keyBy(
			defaultValue || [],
			'walletAddress'
		);

		collection?.nfts
			.filter((nft) => !!nft.tier?.nativeID)
			.forEach((nft) => {
				const wallet = nft.owner.id.toLowerCase();
				const nftId = nft.tier!.nativeID;

				if (!membersAccumulator[wallet]) {
					membersAccumulator[wallet] = { walletAddress: wallet, tiers: [nftId] };
					return;
				}

				if (!membersAccumulator[wallet].tiers.includes(nftId)) {
					membersAccumulator[wallet].tiers.push(nftId);
				}
			});

		return Object.values(membersAccumulator);
	}

	public async getDaosMembers(daoAddresses: string[]) {
		const daosMembersAccumulator: DaosMembersByNftData = {};

		const limit = pLimit(MAX_GRAPH_CONCURRENT_REQUETS_COUNT);

		await Promise.all(
			daoAddresses.map(async (daoAddress) => {
				let skipNfts = 0;

				daosMembersAccumulator[daoAddress] = [];

				while (true) {
					const graphResponse = await limit(() =>
						this.graphClient.getDaoMembersByNfts(daoAddress, DEFAULT_QUERY_LIMIT, skipNfts)
					);

					if (!graphResponse.daos[0]) break;

					// TODO: daos (where: {id}) -> dao (id) graph request
					daosMembersAccumulator[daoAddress] = this.transformNftsToMembershipData(
						daosMembersAccumulator[daoAddress], // as accumulator of previous entries
						graphResponse.daos[0].collection
					);

					if ((graphResponse.daos[0].collection?.nfts?.length ?? 0) < DEFAULT_QUERY_LIMIT) break;

					skipNfts += DEFAULT_QUERY_LIMIT;
				}
			})
		);

		return daosMembersAccumulator;
	}

	public async getDeprecatedDaosMembers(daoAddresses: string[]) {
		let daosMembersAccumulator: DaosMembersByNftData = {};

		await Promise.all(
			daoAddresses.map(async (daoAddress) => {
				let erc721Address = await this.blockchainERC721ContractService.getAppAddress({ daoAddress });

				erc721Address = erc721Address.toLowerCase();

				let skipNfts = 0;

				while (true) {
					const graphResponse = await this.graphClient.getCollectionNfts(erc721Address, DEFAULT_QUERY_LIMIT, skipNfts);

					daosMembersAccumulator[daoAddress] = this.transformNftsToMembershipData(
						daosMembersAccumulator[daoAddress], // as accumulator of previous entries
						graphResponse.collection
					);

					if ((graphResponse.collection?.nfts?.length ?? 0) < DEFAULT_QUERY_LIMIT) break;

					skipNfts += DEFAULT_QUERY_LIMIT;
				}
			})
		);

		return daosMembersAccumulator;
	}
}
