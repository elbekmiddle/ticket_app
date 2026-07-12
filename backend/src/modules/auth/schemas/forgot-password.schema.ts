import { z } from 'zod'

export const forgotPasswordSchema = z.object({
	email: z.string().email({ message: 'INVALID_EMAIL_FORMAT' }),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
