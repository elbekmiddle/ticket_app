import { z } from 'zod'

export const createSubscriptionSchema = z.object({
	plan: z.enum(['monthly'], { message: 'SUBSCRIPTION_INVALID_PLAN' }),
})

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>
