import { z } from 'zod';
import slugify from 'slugify';
import { SLUG_REGEX, SLUG_MIN_LENGTH, NO_EMOJI_REGEX } from '@sd/superdao-shared';

export const daoSchema = z.object({
	id: z.string(),
	name: z.string().min(SLUG_MIN_LENGTH).max(100).regex(NO_EMOJI_REGEX, 'Sorry, no emojis'),
	description: z.string().min(1),
	slug: z
		.string()
		.min(SLUG_MIN_LENGTH)
		.max(100)
		.regex(SLUG_REGEX, 'Invalid shortname')
		.transform((value) => slugify(value, { lower: true })),
	avatar: z.string().nullish(),
	cover: z.string().nullish(),
	site: z.string().nullable().or(z.literal('')),
	twitter: z.string().nullable().or(z.literal('')),
	instagram: z.string().nullable().or(z.literal('')),
	telegram: z.string().nullable().or(z.literal('')),
	discord: z.string().nullable().or(z.literal('')),
	whitelistUrl: z.string().nullable().or(z.literal('')),

	documents: z.array(
		z.union([
			z.object({
				name: z.string().min(1).or(z.literal('')),
				url: z.string().min(1).or(z.literal(''))
			}),
			z.object({
				name: z.string().length(0),
				url: z.string().length(0)
			})
		])
	),
	tiersVotingWeights: z.array(
		z.object({
			tierId: z.string().min(1),
			weight: z.number().min(0)
		})
	)
});

export const votingSchema = z.object({
	tiersVotingWeights: z.array(
		z.object({
			tierId: z.string().min(1),
			weight: z.number({
				invalid_type_error: 'Voting power must be a number'
			})
		})
	)
});

export type DaoFields = z.infer<typeof daoSchema>;
export type VotingFields = z.infer<typeof votingSchema>;

export const createDaoRequest = daoSchema.omit({
	id: true
});
export type CreateDaoRequest = z.infer<typeof createDaoRequest>;

export const createVotingRequest = votingSchema;

export type CreateVotingRequest = z.infer<typeof createVotingRequest>;

export const daoWithShortSlugSchema = daoSchema.extend({
	name: z.string().min(1).max(100),
	slug: z
		.string()
		.min(1)
		.max(100)
		.regex(SLUG_REGEX, 'Invalid shortname')
		.transform((value) => slugify(value, { lower: true }))
});
export type DaoShortSlugFields = z.infer<typeof daoWithShortSlugSchema>;

export const createDaoShortSlugRequest = daoWithShortSlugSchema.omit({
	id: true
});
export type CreateDaoShortSlugRequest = z.infer<typeof createDaoShortSlugRequest>;
