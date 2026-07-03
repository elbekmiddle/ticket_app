import { AuthErrorMessages } from 'src/config/errors'
import z from 'zod'

export const ResendOtpSchema = z.object({
	verificationToken: z.string(),
})