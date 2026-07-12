import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { TicketRepository } from '../repositories/ticket.repository'
import { MovieRepository } from 'src/modules/movies/repositories/movie.repository'
import { SubscriptionRepository } from 'src/modules/subscriptions/repositories/subscription.repository'
import { UserRepository } from 'src/modules/auth/repositories/user.repository'
import { PurchaseTicketInput } from '../schemas/purchase-ticket.schema'
import { TicketErrorMessages } from 'src/config/errors'

// Sodiq mijoz (tier 2) chegirmasi — hujjatga ko'ra 10%
const TIER_2_DISCOUNT = 0.1
// Nechta premyera chipta sotib olingach avtomatik tier2 beriladi
const TIER_2_THRESHOLD = 3

@Injectable()
export class TicketService {
	constructor(
		private readonly ticketRepository: TicketRepository,
		private readonly movieRepository: MovieRepository,
		private readonly subscriptionRepository: SubscriptionRepository,
		private readonly userRepository: UserRepository,
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

		const user = await this.userRepository.findById(userId)

		// Narx faqat KO'RSATISH uchun hisoblanadi — haqiqiy pul yechish hali yo'q
		// (ESLATMA: to'lov integratsiyasi — Payme/Click — keyingi bosqichda shu yerga qo'shiladi,
		// hozircha to'lov muvaffaqiyatli deb faraz qilinadi va chipta darhol yaratiladi).
		const basePrice = movie.price !== null ? Number(movie.price) : null
		const isDiscounted = user?.tier >= 2
		const finalPrice = basePrice !== null && isDiscounted
			? Math.round(basePrice * (1 - TIER_2_DISCOUNT))
			: basePrice

		const ticket = await this.ticketRepository.create(userId, dto.movieId)

		// Tier2'ga avtomatik o'tish — faqat premyera chiptalar sanaladi (init.sql'dagi
		// biznes qoidaga mos: "kamida 3 ta premyera chiptasi sotib olgan foydalanuvchilar").
		let tierUpgraded = false
		if (movie.is_premiere && user && user.tier < 2) {
			const premiereCount = await this.ticketRepository.countPremiereTicketsByUserId(userId)
			if (premiereCount >= TIER_2_THRESHOLD) {
				await this.userRepository.updateTier(userId, 2)
				tierUpgraded = true
			}
		}

		return {
			success: true,
			ticket,
			pricing: { basePrice, finalPrice, discountApplied: isDiscounted },
			tierUpgraded,
		}
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
