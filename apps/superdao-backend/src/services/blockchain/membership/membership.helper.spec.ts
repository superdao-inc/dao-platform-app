import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

import { GraphClient } from 'src/services/the-graph/graph-polygon/graph.client';

import { BlockchainAdminContractService } from '../contracts/admin/admin.service';
import { BlockchainERC721ContractService } from '../contracts/erc721/erc721.service';

import { BlockchainMembershipHelper } from './membership.helper';
import { ForbiddenError } from 'src/exceptions';
import { deprecatedDaos } from '../blockchain.constants';

const compileModuleWithCustomMockedGraphClientProvider = async ({
	graphUseValue,
	adminContractUseValue,
	erc721ContractUseValue
}: {
	graphUseValue: any;
	adminContractUseValue: any;
	erc721ContractUseValue: any;
}) => {
	return Test.createTestingModule({
		providers: [
			BlockchainMembershipHelper,
			{
				provide: BlockchainAdminContractService,
				useValue: adminContractUseValue
			},
			{
				provide: BlockchainERC721ContractService,
				useValue: erc721ContractUseValue
			},
			{
				provide: GraphClient,
				useValue: graphUseValue
			}
		]
	})
		.overrideProvider(Logger)
		.useValue({ error: jest.fn() })
		.compile();
};

describe('BlockchainMembershipHelper', () => {
	describe('getting daos membership helping data', () => {
		let blockchainMembershipHelper: BlockchainMembershipHelper;

		beforeEach(async () => {
			const moduleRef = await Test.createTestingModule({
				providers: [
					BlockchainMembershipHelper,
					BlockchainAdminContractService,
					BlockchainERC721ContractService,
					{
						provide: GraphClient,
						useValue: {}
					}
				]
			})
				.overrideProvider(Logger)
				.useValue({ error: jest.fn() })
				.compile();

			blockchainMembershipHelper = moduleRef.get<BlockchainMembershipHelper>(BlockchainMembershipHelper);

			// can access to private field
			jest.spyOn(blockchainMembershipHelper['logger'], 'error').mockImplementation(() => null);
		});

		describe('validating dao adresses', () => {
			it('should throw forbidden error on 0 valid addresses', async () => {
				const daoAddresses = ['asdsdf'];

				expect(() => {
					blockchainMembershipHelper.validateDaoAdresses(daoAddresses);
				}).toThrowError(ForbiddenError);
			});

			it('should filter non adresses', async () => {
				const daoAddresses = ['asdsdf', '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'];

				expect(blockchainMembershipHelper.validateDaoAdresses(daoAddresses)).toEqual([
					'0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'
				]);
			});
		});

		it('should separate dao adresses', async () => {
			const selectedDeprecatedAdresses = [deprecatedDaos[0], deprecatedDaos[1]];
			const selectedActualAdresses = ['0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'.toLowerCase()];

			const daoAddresses = [...selectedDeprecatedAdresses, ...selectedActualAdresses];

			expect(blockchainMembershipHelper.separateDaoAdresses(daoAddresses)).toEqual({
				deprecatedAddresses: selectedDeprecatedAdresses,
				actualAddresses: selectedActualAdresses
			});
		});

		describe('transforming Graph daos admins response', () => {
			it('should return empty object on empty daos array', async () => {
				const graphDaosAdminsResponse: any = [];

				expect(blockchainMembershipHelper.transformGraphDaosAdminsResponse(graphDaosAdminsResponse)).toEqual({});
			});

			it('should reduce daos array', async () => {
				const graphDaosAdminsResponse = [
					{
						id: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c',
						controller: {
							admins: [
								{
									user: {
										id: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'
									}
								},
								{
									user: {
										id: '0x5509902949E4C4D688FF7236c4E6D2dEcD5B6B6c'
									}
								}
							]
						}
					}
				];

				expect(blockchainMembershipHelper.transformGraphDaosAdminsResponse(graphDaosAdminsResponse)).toEqual({
					['0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c']: [
						'0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c',
						'0x5509902949E4C4D688FF7236c4E6D2dEcD5B6B6c'
					]
				});
			});
		});

		describe('transforming Graph nfts response to daos membership data', () => {
			it('should return empty array on empty input', async () => {
				const defaultValue: any = [];

				const graphResponse = {
					nfts: []
				};

				expect(blockchainMembershipHelper.transformNftsToMembershipData(defaultValue, graphResponse)).toEqual([]);
			});

			it('should generate data from scratch', async () => {
				const defaultValue: any = [];

				const graphResponse = {
					nfts: [
						{
							owner: {
								id: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'.toLowerCase()
							},
							tier: {
								nativeID: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'
							}
						}
					]
				};

				expect(blockchainMembershipHelper.transformNftsToMembershipData(defaultValue, graphResponse)).toEqual([
					{
						walletAddress: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'.toLowerCase(),
						tiers: ['0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c']
					}
				]);
			});

			it('should concat tiers on several nfts for one owner', async () => {
				const defaultValue: any = [];

				const graphResponse = {
					nfts: [
						{
							owner: {
								id: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'.toLowerCase()
							},
							tier: {
								nativeID: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'
							}
						},
						{
							owner: {
								id: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'.toLowerCase()
							},
							tier: {
								nativeID: 'test'
							}
						}
					]
				};

				expect(blockchainMembershipHelper.transformNftsToMembershipData(defaultValue, graphResponse)).toEqual([
					{
						walletAddress: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'.toLowerCase(),
						tiers: ['0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c', 'test']
					}
				]);
			});

			it('should save previous data', async () => {
				const defaultValue: any = [
					{
						walletAddress: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'.toLowerCase(),
						tiers: ['asd', 'dsa']
					}
				];

				const graphResponse = {
					nfts: [
						{
							owner: {
								id: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'.toLowerCase()
							},
							tier: {
								nativeID: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'
							}
						},
						{
							owner: {
								id: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'.toLowerCase()
							},
							tier: {
								nativeID: 'test'
							}
						}
					]
				};

				expect(blockchainMembershipHelper.transformNftsToMembershipData(defaultValue, graphResponse)).toEqual([
					{
						walletAddress: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c'.toLowerCase(),
						tiers: ['asd', 'dsa', '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c', 'test']
					}
				]);
			});
		});
	});

	describe('getting daos members data', () => {
		it('should get actual daos members', async () => {
			const graphResponse: any = {
				daos: [
					{
						collection: {
							nfts: [
								{
									owner: {
										id: 'asd'
									},
									tier: {
										nativeID: 'dsa'
									}
								},
								{
									owner: {
										id: 'asd'
									},
									tier: {
										nativeID: 'asd'
									}
								}
							]
						}
					}
				]
			};

			const moduleRef = await compileModuleWithCustomMockedGraphClientProvider({
				graphUseValue: {
					getDaoMembersByNfts: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(graphResponse)))
				},
				adminContractUseValue: {},
				erc721ContractUseValue: {}
			});

			const blockchainMembershipHelper = moduleRef.get<BlockchainMembershipHelper>(BlockchainMembershipHelper);

			expect(await blockchainMembershipHelper.getDaosMembers(['123', '234'])).toEqual({
				['123']: [{ walletAddress: 'asd', tiers: ['dsa', 'asd'] }],
				['234']: [{ walletAddress: 'asd', tiers: ['dsa', 'asd'] }]
			});
		});

		it('should get deprecated daos members', async () => {
			const appAddress = '123';
			const graphResponse: any = {
				collection: {
					nfts: [
						{
							owner: {
								id: 'asd'
							},
							tier: {
								nativeID: 'dsa'
							}
						},
						{
							owner: {
								id: 'asd'
							},
							tier: {
								nativeID: 'asd'
							}
						}
					]
				}
			};

			const moduleRef = await compileModuleWithCustomMockedGraphClientProvider({
				graphUseValue: {
					getCollectionNfts: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(graphResponse)))
				},
				adminContractUseValue: {},
				erc721ContractUseValue: {
					getAppAddress: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(appAddress)))
				}
			});

			const blockchainMembershipHelper = moduleRef.get<BlockchainMembershipHelper>(BlockchainMembershipHelper);

			expect(await blockchainMembershipHelper.getDeprecatedDaosMembers(['123', '234'])).toEqual({
				['123']: [{ walletAddress: 'asd', tiers: ['dsa', 'asd'] }],
				['234']: [{ walletAddress: 'asd', tiers: ['dsa', 'asd'] }]
			});
		});
	});

	describe('getting daos admins data', () => {
		it('should get actual daos admins', async () => {
			const graphResponse: any = {
				daos: [
					{
						id: '123',
						controller: {
							admins: [{ user: { id: 'asd' } }, { user: { id: 'dsa' } }]
						}
					},
					{
						id: '234',
						controller: {
							admins: [{ user: { id: 'bob' } }, { user: { id: 'nill' } }]
						}
					}
				]
			};

			const moduleRef = await compileModuleWithCustomMockedGraphClientProvider({
				graphUseValue: {
					getDaosAdmins: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(graphResponse)))
				},
				adminContractUseValue: {},
				erc721ContractUseValue: {}
			});

			const blockchainMembershipHelper = moduleRef.get<BlockchainMembershipHelper>(BlockchainMembershipHelper);

			expect(await blockchainMembershipHelper.getDaosAdmins(['123', '234'])).toEqual({
				['123']: ['asd', 'dsa'],
				['234']: ['bob', 'nill']
			});
		});

		it('should get deprecated daos admins', async () => {
			const appAddress = '123';
			const adminContract = {
				adminAddresses: async () => {
					return new Promise((res) => res(['test', 'test1']));
				}
			};

			const moduleRef = await compileModuleWithCustomMockedGraphClientProvider({
				graphUseValue: {},
				adminContractUseValue: {
					getAppAddress: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(appAddress))),
					getAdminContract: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(adminContract)))
				},
				erc721ContractUseValue: {}
			});

			const blockchainMembershipHelper = moduleRef.get<BlockchainMembershipHelper>(BlockchainMembershipHelper);

			expect(await blockchainMembershipHelper.getDeprecatedDaosAdmins(['123', '234'])).toEqual({
				['123']: ['test', 'test1'],
				['234']: ['test', 'test1']
			});
		});
	});
});
