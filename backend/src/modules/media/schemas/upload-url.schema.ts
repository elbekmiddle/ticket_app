import { z } from 'zod'

export const uploadUrlSchema = z.object({
	type: z.enum(['video', 'poster'], { message: 'TYPE_MUST_BE_VIDEO_OR_POSTER' }),
	fileName: z.string().min(1).max(255),
	contentType: z.string(),
}).refine(
	(data) => {
		if (data.type === 'video') return data.contentType.startsWith('video/')
		return data.contentType.startsWith('image/')
	},
	{ message: 'CONTENT_TYPE_DOES_NOT_MATCH_TYPE', path: ['contentType'] },
)

export type UploadUrlInput = z.infer<typeof uploadUrlSchema>
