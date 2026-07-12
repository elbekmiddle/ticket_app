import { z } from 'zod'

export const createMovieSchema = z.object({
	title: z.string().min(1, { message: 'TITLE_REQUIRED' }),
	description: z.string().optional(),
	isPremiere: z.coerce.boolean().default(false),
	premiereDate: z.string().datetime().optional(),
	price: z.coerce.number().nonnegative({ message: 'INVALID_PRICE' }).optional(),
	posterUrl: z.string().url().optional(),
	videoUrl: z.string().url().optional(),
	downloadUnlockMonths: z.coerce.number().int().min(1).max(24).optional(),
}).refine(
	(data) => !data.isPremiere || (data.isPremiere && data.price !== undefined),
	{ message: 'INVALID_PRICE', path: ['price'] },
)

export type CreateMovieInput = z.infer<typeof createMovieSchema>
