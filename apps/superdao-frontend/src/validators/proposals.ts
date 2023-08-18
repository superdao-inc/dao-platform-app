import { z } from 'zod';

import { CHOICE_CONTENT_MAX_LENGTH, PROPOSAL_TITLE_MAX_LENGTH } from '@sd/superdao-shared';

import { ProposalVotingType, ProposalVotingPowerType } from 'src/types/types.generated';

export const proposalSchema = z.object({
	title: z.string().min(1).max(PROPOSAL_TITLE_MAX_LENGTH),
	description: z.string(),
	attachment: z.string().uuid().nullish(),
	votingPowerType: z.nativeEnum(ProposalVotingPowerType),
	votingType: z.nativeEnum(ProposalVotingType),
	startAt: z.date(),
	endAt: z.date(),
	choices: z.array(
		z.union([
			z.object({
				name: z.string().min(1).max(CHOICE_CONTENT_MAX_LENGTH)
			}),
			z.object({
				name: z.string().length(0)
			})
		])
	)
});
export type ProposalFields = z.infer<typeof proposalSchema>;

export type CreateProposalRequest = z.infer<typeof proposalSchema>;
