import { Test } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

import { BlockchainDaoService } from './dao.service';

import { wallet } from '../blockchain.constants';

describe('BlockchainDaoService', () => {
	describe('deploing dao', () => {
		let blockchainDaoService: BlockchainDaoService;
		let mockedWalletProvider: jest.SpyInstance<any>;

		const anyTransactionHash: string = '0x7f589b912df88aaba92f48280a0b5e52aa8836023fab8ac9f7b0f72c4f6e1a96';

		beforeEach(async () => {
			const moduleRef = await Test.createTestingModule({
				providers: [BlockchainDaoService, Logger]
			})
				.overrideProvider(Logger)
				.useValue({ error: jest.fn() })
				.compile();

			blockchainDaoService = moduleRef.get<BlockchainDaoService>(BlockchainDaoService);

			mockedWalletProvider = jest.spyOn(wallet.provider, 'waitForTransaction');

			// can access to private field
			jest.spyOn(blockchainDaoService['logger'], 'error').mockImplementation(() => null);
		});

		it('should log error on empty receipt logs', async () => {
			const receipt = { logs: [] };

			mockedWalletProvider.mockImplementation(() => new Promise((res) => res(receipt)));

			await blockchainDaoService.getDeployedByTxDaoAddress({ txHash: anyTransactionHash });

			// can access to private field
			expect(blockchainDaoService['logger'].error).toBeCalledTimes(1);
		});

		it('should return null on empty receipt logs', async () => {
			const receipt = { logs: [] };

			mockedWalletProvider.mockImplementation(() => new Promise((res) => res(receipt)));

			expect(await blockchainDaoService.getDeployedByTxDaoAddress({ txHash: anyTransactionHash })).toBeNull();
		});
	});
});
