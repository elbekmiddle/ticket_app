import { z } from "zod"

export const verifyEmailSchema = z.object({
	verificationToken: z.string(),
	otp: z.string().length(6),
})

export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>