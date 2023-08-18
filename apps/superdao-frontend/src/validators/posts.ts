import { z } from 'zod';
import { sanitizeString } from '@sd/superdao-shared';

export const createPostRequest = z.object({
	daoId: z.string().uuid(),
	text: z.string().max(4000).transform(sanitizeString),
	attachments: z.array(z.string().uuid())
});
export type CreatePostRequest = z.infer<typeof createPostRequest>;
