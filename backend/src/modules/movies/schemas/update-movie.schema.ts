import { z } from 'zod'

export const updateMovieSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().optional(),
	posterUrl: z.string().url().optional(),
	videoUrl: z.string().url().optional(),
	price: z.coerce.number().nonnegative().optional(),
})

export type UpdateMovieInput = z.infer<typeof updateMovieSchema>
