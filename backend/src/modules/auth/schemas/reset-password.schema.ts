import { z } from 'zod'

export const resetPasswordSchema = z.object({
	email: z.string().email({ message: 'INVALID_EMAIL_FORMAT' }),
	otp: z.string().length(6, { message: 'OTP_MUST_BE_6_DIGITS' }),
	newPassword: z.string().min(8, { message: 'PASSWORD_TOO_SHORT' }),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
