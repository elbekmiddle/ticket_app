import { z } from 'zod'

export const verifyEmailSchema = z.object({
	verificationToken: z.string().min(1),
	otp: z.string().length(6, { message: 'OTP_MUST_BE_6_DIGITS' }),
})

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
