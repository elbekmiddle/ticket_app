import { AuthErrorMessages } from 'src/config/errors'
import z from 'zod'

export const VerifyEmailSchem = z.object({
	verificationToken: z.string(),
	otp: z.string().length(6, { message: AuthErrorMessages.OTP_MUST_BE_6_DIGITS }),
})