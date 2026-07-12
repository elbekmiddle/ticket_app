import { z } from 'zod'

export const createReviewSchema = z.object({
	movieId: z.string().uuid({ message: 'MOVIE_ID_MUST_BE_UUID' }),
	rating: z.coerce.number().int().min(1).max(5, { message: 'RATING_MUST_BE_1_TO_5' }),
	comment: z.string().trim().min(1, { message: 'COMMENT_REQUIRED' }).max(2000),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
