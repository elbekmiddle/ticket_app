import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { TicketRepository } from '../repositories/ticket.repository'
import { MovieRepository } from 'src/modules/movies/repositories/movie.repository'
import { SubscriptionRepository } from 'src/modules/subscriptions/repositories/subscription.repository'
import { PurchaseTicketInput } from '../schemas/purchase-ticket.schema'
import { TicketErrorMessages } from 'src/config/errors'

@Injectable()
export class TicketService {
	constructor(
		private readonly ticketRepository: TicketRepository,
		private readonly movieRepository: MovieRepository,
		private readonly subscriptionRepository: SubscriptionRepository,
	) { }

	async purchase(userId: string, dto: PurchaseTicketInput) {
		const movie = await this.movieRepository.findById(dto.movieId)

		if (!movie) {
			throw new NotFoundException(TicketErrorMessages.MOVIE_NOT_FOUND)
		}

		const existing = await this.ticketRepository.findByUserAndMovie(userId, dto.movieId)

		if (existing) {
			throw new BadRequestException(TicketErrorMessages.ALREADY_PURCHASED)
		}

		// ESLATMA: bu yerga to'lov integratsiyasi (Payme/Click) qo'shiladi keyingi bosqichda —
		// hozircha to'lov muvaffaqiyatli deb faraz qilinadi va chipta darhol yaratiladi.
		const ticket = await this.ticketRepository.create(userId, dto.movieId)

		return { success: true, ticket }
	}

	async myTickets(userId: string) {
		const items = await this.ticketRepository.findAllByUserId(userId)
		return { success: true, items }
	}

	// Kino tomosha qilishdan oldin chaqiriladigan asosiy access-check.
	// Qoida: premyera kino => faqat chipta egasi ko'ra oladi (obuna yetarli emas).
	//        oddiy kino => faol obuna YOKI chipta bo'lsa yetarli.
	async checkAccess(userId: string, movieId: string) {
		const movie = await this.movieRepository.findById(movieId)

		if (!movie) {
			throw new NotFoundException(TicketErrorMessages.MOVIE_NOT_FOUND)
		}

		const ticket = await this.ticketRepository.findByUserAndMovie(userId, movieId)

		if (ticket) {
			return { success: true, hasAccess: true, reason: 'ticket', canDownload: ticket.can_download }
		}

		if (!movie.is_premiere) {
			const activeSub = await this.subscriptionRepository.findActiveByUserId(userId)
			if (activeSub) {
				return { success: true, hasAccess: true, reason: 'subscription', canDownload: false }
			}
		}

		throw new ForbiddenException(TicketErrorMessages.NO_ACCESS)
	}
}
