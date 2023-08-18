import { Test } from '@nestjs/testing';

import { GraphClient } from 'src/services/the-graph/graph-polygon/graph.client';
import { NotFoundError } from 'src/exceptions';
import { BlockchainTreasuryService } from './treasury.service';

const compileModuleWithCustomMockedGraphClientProvider = async (useValue: any) => {
	return Test.createTestingModule({
		providers: [
			BlockchainTreasuryService,
			{
				provide: GraphClient,
				useValue
			}
		]
	}).compile();
};

describe('BlockchainTreasuryService', () => {
	describe('getting dao main treasury wallet', () => {
		let blockchainTreasuryService: BlockchainTreasuryService;

		const anyDaoAddress: string = '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c';

		it('should throw NotFoundError on empty daos list response', async () => {
			const response = { daos: [] };

			const moduleRef = await compileModuleWithCustomMockedGraphClientProvider({
				getDaoTreasury: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(response)))
			});

			blockchainTreasuryService = moduleRef.get<BlockchainTreasuryService>(BlockchainTreasuryService);

			expect(async () => {
				await blockchainTreasuryService.wallet({ daoAddress: anyDaoAddress });
			}).rejects.toThrow(NotFoundError);
		});

		it('should return wallet of dao', async () => {
			const testTreasuryWalletRightAnswer = 'test';
			const response = {
				daos: [
					{ contractAddress: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c', treasury: testTreasuryWalletRightAnswer }
				]
			};

			const moduleRef = await compileModuleWithCustomMockedGraphClientProvider({
				getDaoTreasury: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(response)))
			});

			blockchainTreasuryService = moduleRef.get<BlockchainTreasuryService>(BlockchainTreasuryService);

			expect(await blockchainTreasuryService.wallet({ daoAddress: anyDaoAddress })).toEqual({
				result: testTreasuryWalletRightAnswer
			});
		});

		it('should return wallet of first dao in array', async () => {
			const testTreasuryWalletRightAnswer = 'test';
			const testTreasuryWalletFalseAnswer = 'fake';
			const response = {
				daos: [
					{ contractAddress: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c', treasury: testTreasuryWalletRightAnswer },
					{ contractAddress: '0x7709902949E4C4D688FF7236c4E6D2dEcD5B6B6c', treasury: testTreasuryWalletFalseAnswer }
				]
			};

			const moduleRef = await compileModuleWithCustomMockedGraphClientProvider({
				getDaoTreasury: jest.fn().mockImplementation(() => new Promise((resolve) => resolve(response)))
			});

			blockchainTreasuryService = moduleRef.get<BlockchainTreasuryService>(BlockchainTreasuryService);

			expect(await blockchainTreasuryService.wallet({ daoAddress: anyDaoAddress })).toEqual({
				result: testTreasuryWalletRightAnswer
			});
		});
	});
});
