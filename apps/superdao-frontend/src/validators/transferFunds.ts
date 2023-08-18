import { isAddress } from 'ethers/lib/utils';
import { i18n } from 'next-i18next';
import { z } from 'zod';

export const transferFundsSchema = z
	.object({
		recipient: z.string().refine((address) => isAddress(address), {
			message: i18n?.t(`components.treasury.transferFundsModal.errors.wrongAddress`) ?? 'Wrong address' // TODO find way to use i18n outside of components
		}),
		token: z.object({ address: z.string().optional(), symbol: z.string() }),
		_availableAmount: z.number().min(0),
		amount: z.number().min(0),
		wallet: z.string()
		// description: z.string().max(250).nullable()
	})
	.refine((schema) => schema._availableAmount >= schema.amount, {
		message: i18n?.t(`components.treasury.transferFundsModal.errors.insufficientFunds`) ?? 'Insufficient funds',
		path: ['amount']
	});
export type TransferFundsFields = z.infer<typeof transferFundsSchema>;
