import { isAddress } from 'ethers/lib/utils';
import { i18n } from 'next-i18next';
import { z } from 'zod';

export const transferNftSchema = z.object({
	recipient: z.string().refine((address) => isAddress(address), {
		message: i18n?.t(`components.treasury.transferFundsModal.errors.wrongAddress`) ?? 'Wrong address' // TODO find way to use i18n outside of components
	}),
	owner: z.string(),
	token: z.object({ address: z.string(), id: z.string(), tierName: z.string() })
	// description: z.string().max(250).nullable()
});

export type TransferNftFields = z.infer<typeof transferNftSchema>;
