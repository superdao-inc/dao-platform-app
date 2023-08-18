import { z } from 'zod';

const airdropParticipant = z.object({
	walletAddress: z.string(),
	tier: z.string(),
	email: z.string()
});

export type AirdropParticipantType = z.infer<typeof airdropParticipant>;

const whitelistParticipant = z.object({
	walletAddress: z.string(),
	tier: z.string(),
	email: z.string()
});

export type WhitelistParticipantType = z.infer<typeof whitelistParticipant>;
