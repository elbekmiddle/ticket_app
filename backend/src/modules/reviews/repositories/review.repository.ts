import { Inject, Injectable } from '@nestjs/common'
import { Pool } from 'pg'

@Injectable()
export class ReviewRepository {
	constructor(
		@Inject('DATABASE_POOL')
		private readonly db: Pool,
	) { }

	// deleted_at IS NULL shart — aks holda soft-deleted review "band qilingan joy"
	// bo'lib qolib, user qayta review yoza olmay qolardi (init.sql'dagi partial
	// unique index shu bilan mos ishlaydi).
	async findByUserAndMovie(userId: string, movieId: string) {
		const { rows } = await this.db.query(
			`SELECT * FROM reviews WHERE user_id = $1 AND movie_id = $2 AND deleted_at IS NULL LIMIT 1`,
			[userId, movieId],
		)
		return rows[0]
	}

	async create(userId: string, movieId: string, rating: number, comment: string) {
		const { rows } = await this.db.query(
			`
			INSERT INTO reviews (user_id, movie_id, rating, comment, created_at)
			VALUES ($1, $2, $3, $4, NOW())
			RETURNING *
			`,
			[userId, movieId, rating, comment],
		)
		return rows[0]
	}

	// Pin qilingan sharhlar birinchi, keyin VIP (tier=3) foydalanuvchilarniki, keyin eng yangisi.
	// Bu — hujjatdagi "VIP sharhlar yuqoriroq reytingga ega bo'ladi" talabining sodda,
	// murakkab ranking-engine kerak bo'lmaydigan implementatsiyasi.
	async findByMovie(movieId: string) {
		const { rows } = await this.db.query(
			`
			SELECT
				r.id, r.rating, r.comment, r.is_pinned, r.created_at,
				u.id AS user_id, u.name AS user_name, u.tier AS user_tier
			FROM reviews r
			JOIN users u ON u.id = r.user_id
			WHERE r.movie_id = $1 AND r.deleted_at IS NULL
			ORDER BY
				r.is_pinned DESC,
				CASE WHEN u.tier = 3 THEN 1 ELSE 0 END DESC,
				r.created_at DESC
			`,
			[movieId],
		)
		return rows
	}

	async findById(id: string) {
		const { rows } = await this.db.query(
			`SELECT * FROM reviews WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
			[id],
		)
		return rows[0]
	}

	async setPinned(id: string, isPinned: boolean) {
		const { rows } = await this.db.query(
			`UPDATE reviews SET is_pinned = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING *`,
			[isPinned, id],
		)
		return rows[0]
	}

	// Haqiqiy DELETE emas — deleted_at = NOW().
	async softDelete(id: string) {
		await this.db.query(`UPDATE reviews SET deleted_at = NOW() WHERE id = $1`, [id])
	}
}
