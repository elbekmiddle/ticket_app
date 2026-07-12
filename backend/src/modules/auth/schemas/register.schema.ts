import { z } from 'zod'

export const registerSchema = z.object({
	name: z.string().min(1, {
		message: 'NAME_REQUIRED',
	}),

	email: z.string().email({
		message: 'INVALID_EMAIL_FORMAT',
	}),

	password: z.string().min(1, {
		message: 'PASSWORD_REQUIRED',
	}),
})

export type RegisterInput = z.infer<typeof registerSchema>