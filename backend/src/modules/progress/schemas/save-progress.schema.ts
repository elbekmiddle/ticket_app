import { z } from 'zod'

export const saveProgressSchema = z.object({
	movieId: z.string().uuid({ message: 'MOVIE_ID_MUST_BE_UUID' }),
	positionSeconds: z.coerce.number().int().min(0).max(24 * 60 * 60, { message: 'POSITION_TOO_LARGE' }),
})

export type SaveProgressInput = z.infer<typeof saveProgressSchema>
