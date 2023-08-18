import { z } from 'zod';

export const daoTiersVotingWeightsSchema = z.object({
	tiers: z.array(
		z.object({
			tierId: z.string().min(1),
			tierVotingWeight: z.number().min(0)
		})
	)
});

export type DaoTiersVotingWeights = z.infer<typeof daoTiersVotingWeightsSchema>;

export const updateDaoTiersVotingWeightsRequest = daoTiersVotingWeightsSchema;
export type updateDaoTiersVotingWeightsRequest = z.infer<typeof updateDaoTiersVotingWeightsRequest>;
