import { z } from 'zod';
import { ETH_ADDRESS_REGEX, OPENSEA_REGEX, TELEGRAM_REGEX } from '@sd/superdao-shared';

export const validationSchema = z.object({
	id: z.string(),
	contractAddress: z.literal('').nullish().or(z.string().regex(ETH_ADDRESS_REGEX, 'Invalid address')),
	openseaUrl: z.literal('').nullish().or(z.string().regex(OPENSEA_REGEX, 'Invalid Opensea collection url')),
	supportChatUrl: z.literal('').nullish().or(z.string().regex(TELEGRAM_REGEX, 'Invalid Telegram link')),
	isVotingEnabled: z.boolean(),
	isClaimEnabled: z.boolean(),
	claimDeployDao: z.boolean(),
	isInternal: z.boolean()
});
