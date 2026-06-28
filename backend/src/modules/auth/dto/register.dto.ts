import {z} from "zod"
import { AuthErrorMessages } from 'src/config/errors'

export const registerSchema = z.object({
	name: z.string().min(2, {message: AuthErrorMessages.NAME_TO_SHORT}),
	email: z.string().email({message: AuthErrorMessages.INVALID_EMAIL_FORMAT}),
	password: z.string().min(8, {message: AuthErrorMessages.WEAK_PASSWORD})
})

export type RegisterDto = z.infer<typeof registerSchema>