import { z } from 'zod';
import { ETH_ADDRESS_REGEX } from '@sd/superdao-shared';

export const nftSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.literal('').or(z.string()),
	symbol: z.string().min(1),
	externalLink: z.string(),
	sellerFeeBasisPoints: z.number().min(0).max(10),
	feeRecipient: z.literal('').or(z.string().regex(ETH_ADDRESS_REGEX, 'Wrong wallet format'))
});
export type NftFields = z.infer<typeof nftSchema>;
