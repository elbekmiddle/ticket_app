import { z } from 'zod'

export const refreshTokenSchema = z.object({
	refreshToken: z.string().min(1, { message: 'REFRESH_TOKEN_REQUIRED' }),
})

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
