import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { MovieRepository } from 'src/modules/movies/repositories/movie.repository'
import { TicketRepository } from '../repositories/ticket.repository'

// Reja (3-bosqich): "Chipta sotib olinganda ishga tushadi, 3 yoki 6 oy taymer qo'yadi
// va vaqt yetib kelgach bazadagi tickets.can_download = true holatiga o'tkazadi."
// Temporal o'rniga (hali alohida servis sifatida qo'shilmagan) — oddiy cron yetarli,
// chunki bu "N vaqtdan keyin bir marta ishla" turidagi vazifa, distributed-saga emas.
@Injectable()
export class DownloadUnlockService {
	private readonly logger = new Logger(DownloadUnlockService.name)

	constructor(
		private readonly movieRepository: MovieRepository,
		private readonly ticketRepository: TicketRepository,
	) { }

	// Har 10 daqiqada — subscription/otp kabi tez-tez emas, chunki bu "kunlar/oylar"
	// aniqlikdagi vazifa, soniyama-soniya bo'lishi shart emas.
	@Cron('*/10 * * * *')
	async unlockDueMovies() {
		const dueMovies = await this.movieRepository.findDueForDownloadUnlock()

		if (dueMovies.length === 0) return

		for (const movie of dueMovies) {
			try {
				await this.ticketRepository.unlockDownloadsDueForMovie(movie.id)
				await this.movieRepository.markDownloadsUnlocked(movie.id)
			} catch (err) {
				this.logger.error(`Download unlock failed for movie=${movie.id}`, err as Error)
			}
		}

		this.logger.log(`Download unlocked for ${dueMovies.length} movie(s)`)
	}
}
