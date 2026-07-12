import { z } from 'zod'

export const updateTierSchema = z.object({
	tier: z.coerce.number().int().min(1).max(3, { message: 'TIER_MUST_BE_1_2_OR_3' }),
})

export type UpdateTierInput = z.infer<typeof updateTierSchema>
