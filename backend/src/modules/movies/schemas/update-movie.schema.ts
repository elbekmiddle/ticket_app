import { z } from 'zod'
import { isAllowedMediaUrl } from 'src/common/validators/allowed-media-url'

export const updateMovieSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().optional(),

	posterUrl: z.string().url().optional()
		.refine((url) => !url || isAllowedMediaUrl(url), { message: 'POSTER_URL_MUST_BE_FROM_OUR_CDN' }),
	videoUrl: z.string().url().optional()
		.refine((url) => !url || isAllowedMediaUrl(url), { message: 'VIDEO_URL_MUST_BE_FROM_OUR_CDN' }),

	price: z.coerce.number().nonnegative().optional(),
	downloadUnlockAt: z.string().datetime().optional(),
	downloadUnlockMonths: z.coerce.number().int().min(1).max(24).optional(),
})

export type UpdateMovieInput = z.infer<typeof updateMovieSchema>
