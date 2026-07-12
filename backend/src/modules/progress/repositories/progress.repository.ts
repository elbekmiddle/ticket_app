import { Inject, Injectable } from '@nestjs/common'
import { Pool } from 'pg'

@Injectable()
export class ProgressRepository {
	constructor(
		@Inject('DATABASE_POOL')
		private readonly db: Pool,
	) { }

	// Cron-worker chaqiradi — Redis'dan kelgan qiymatni Postgres'ga "flush" qiladi.
	async upsert(userId: string, movieId: string, positionSeconds: number) {
		await this.db.query(
			`
			INSERT INTO user_video_progress (user_id, movie_id, last_position_seconds, updated_at)
			VALUES ($1, $2, $3, NOW())
			ON CONFLICT (user_id, movie_id)
			DO UPDATE SET last_position_seconds = EXCLUDED.last_position_seconds, updated_at = NOW()
			`,
			[userId, movieId, positionSeconds],
		)
	}

	// Redis'da hali flush bo'lmagan holat bo'lsa (masalan worker hali ishga tushmagan
	// yoki Redis TTL tugagan bo'lsa), shu yerdan fallback sifatida o'qiladi.
	async find(userId: string, movieId: string) {
		const { rows } = await this.db.query(
			`SELECT last_position_seconds FROM user_video_progress WHERE user_id = $1 AND movie_id = $2 LIMIT 1`,
			[userId, movieId],
		)
		return rows[0]
	}
}
