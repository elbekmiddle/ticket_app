import { z } from 'zod'

export const uploadUrlSchema = z.object({
	fileName: z.string().min(1).max(255),
	contentType: z.string().regex(/^video\//, { message: 'ONLY_VIDEO_CONTENT_TYPE_ALLOWED' }),
})

export type UploadUrlInput = z.infer<typeof uploadUrlSchema>
