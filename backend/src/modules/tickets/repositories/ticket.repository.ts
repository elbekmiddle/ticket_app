import { Inject, Injectable } from '@nestjs/common'
import { Pool } from 'pg'

@Injectable()
export class TicketRepository {
	constructor(
		@Inject('DATABASE_POOL')
		private readonly db: Pool,
	) { }

	async findByUserAndMovie(userId: string, movieId: string) {
		const { rows } = await this.db.query(
			`SELECT * FROM tickets WHERE user_id = $1 AND movie_id = $2 LIMIT 1`,
			[userId, movieId],
		)
		return rows[0]
	}

	// UNIQUE(user_id, movie_id) constraint DB darajasida ham bor (init.sql'ga qarang) —
	// bu yerdagi oldindan tekshiruv + DB constraint birgalikda ikki marta sotib
	// olishning oldini oladi (masalan ikkita parallel so'rov kelsa ham).
	async create(userId: string, movieId: string) {
		try {
			const { rows } = await this.db.query(
				`
				INSERT INTO tickets (user_id, movie_id, can_download, purchased_at)
				VALUES ($1, $2, false, NOW())
				RETURNING *
				`,
				[userId, movieId],
			)
			return rows[0]
		} catch (err: any) {
			if (err.code === '23505') {
				// unique_violation — parallel so'rov tufayli yuzaga kelgan race condition
				return this.findByUserAndMovie(userId, movieId)
			}
			throw err
		}
	}

	async findAllByUserId(userId: string) {
		const { rows } = await this.db.query(
			`
			SELECT t.*, m.title, m.poster_url
			FROM tickets t
			JOIN movies m ON m.id = t.movie_id
			WHERE t.user_id = $1
			ORDER BY t.purchased_at DESC
			`,
			[userId],
		)
		return rows
	}

	async unlockDownloadsDueForMovie(movieId: string) {
		await this.db.query(
			`UPDATE tickets SET can_download = true WHERE movie_id = $1 AND can_download = false`,
			[movieId],
		)
	}

	// Faqat premyera kinolar uchun sotib olingan chiptalar sanaladi — tier2 shartiga
	// mos: "kamida 3 ta premyera chiptasi". Oddiy kino chiptalari hisoblanmaydi.
	async countPremiereTicketsByUserId(userId: string) {
		const { rows } = await this.db.query(
			`
			SELECT COUNT(*)::int AS count
			FROM tickets t
			JOIN movies m ON m.id = t.movie_id
			WHERE t.user_id = $1 AND m.is_premiere = true
			`,
			[userId],
		)
		return rows[0].count as number
	}
}
