import { z } from 'zod'

export const purchaseTicketSchema = z.object({
	movieId: z.string().uuid({ message: 'MOVIE_ID_MUST_BE_UUID' }),
})

export type PurchaseTicketInput = z.infer<typeof purchaseTicketSchema>
