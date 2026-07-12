import { z } from 'zod'

export const resendOtpSchema = z.object({
	email: z.string().email({ message: 'INVALID_EMAIL_FORMAT' }),
})

export type ResendOtpInput = z.infer<typeof resendOtpSchema>
