import { z } from 'zod'
import { isAllowedMediaUrl } from 'src/common/validators/allowed-media-url'

export const createMovieSchema = z.object({
	title: z.string().min(1, { message: 'TITLE_REQUIRED' }),
	description: z.string().optional(),
	isPremiere: z.coerce.boolean().default(false),
	premiereDate: z.string().datetime().optional(),
	price: z.coerce.number().nonnegative({ message: 'INVALID_PRICE' }).optional(),

	posterUrl: z.string().url().optional()
		.refine((url) => !url || isAllowedMediaUrl(url), { message: 'POSTER_URL_MUST_BE_FROM_OUR_CDN' }),
	videoUrl: z.string().url().optional()
		.refine((url) => !url || isAllowedMediaUrl(url), { message: 'VIDEO_URL_MUST_BE_FROM_OUR_CDN' }),

	// Ikkalasi ham ixtiyoriy — downloadUnlockAt berilsa, u ustunlik qiladi (aniq sana).
	// Bo'lmasa downloadUnlockMonths ishlatiladi (premiereDate + N oy, nisbiy).
	downloadUnlockAt: z.string().datetime().optional(),
	downloadUnlockMonths: z.coerce.number().int().min(1).max(24).optional(),
}).refine(
	(data) => !data.isPremiere || (data.isPremiere && data.price !== undefined),
	{ message: 'INVALID_PRICE', path: ['price'] },
)

export type CreateMovieInput = z.infer<typeof createMovieSchema>
