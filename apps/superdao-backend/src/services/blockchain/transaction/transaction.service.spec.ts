import { TransactionReceipt } from '@ethersproject/providers';
import { Test } from '@nestjs/testing';

import { BlockchainTransactionService } from './transaction.service';

describe('BlockchainTransactionService', () => {
	describe('transaction status checking', () => {
		let blockchainTransactionService: BlockchainTransactionService;
		let mockedReceiptGetter: jest.SpyInstance<Promise<TransactionReceipt | null>>;

		const anyTransactionHash: string = '0x7f589b912df88aaba92f48280a0b5e52aa8836023fab8ac9f7b0f72c4f6e1a96';

		beforeEach(async () => {
			const moduleRef = await Test.createTestingModule({
				providers: [BlockchainTransactionService]
			}).compile();

			blockchainTransactionService = moduleRef.get<BlockchainTransactionService>(BlockchainTransactionService);

			mockedReceiptGetter = jest.spyOn(blockchainTransactionService, 'getTransactionReceipt');
		});

		it('should return AWAIT_CONFIRMATION on null receipt', async () => {
			const tx = null;

			mockedReceiptGetter.mockImplementation(() => new Promise((res) => res(tx)));

			expect(
				await blockchainTransactionService.checkTransactionStatus({ transactionHash: anyTransactionHash })
			).toEqual('AWAIT_CONFIRMATION');
		});

		it('should return AWAIT_CONFIRMATION on null tx.status', async () => {
			const tx = { status: null } as unknown as TransactionReceipt;

			mockedReceiptGetter.mockImplementation(() => new Promise((res) => res(tx)));

			expect(
				await blockchainTransactionService.checkTransactionStatus({ transactionHash: anyTransactionHash })
			).toEqual('AWAIT_CONFIRMATION');
		});

		it('should return FINALIZED on tx.status === 1', async () => {
			const tx = { status: 1 } as unknown as TransactionReceipt;

			mockedReceiptGetter.mockImplementation(() => new Promise((res) => res(tx)));

			expect(
				await blockchainTransactionService.checkTransactionStatus({ transactionHash: anyTransactionHash })
			).toEqual('FINALIZED');
		});

		it('should return FAILED on tx.status === 0', async () => {
			const tx = { status: 0 } as unknown as TransactionReceipt;

			mockedReceiptGetter.mockImplementation(() => new Promise((res) => res(tx)));

			expect(
				await blockchainTransactionService.checkTransactionStatus({ transactionHash: anyTransactionHash })
			).toEqual('FAILED');
		});
	});
});
