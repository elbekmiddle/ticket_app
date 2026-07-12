import { Inject, Injectable } from '@nestjs/common'
import { Pool } from 'pg'
import { CreateMovieInput } from '../schemas/create-movie.schema'
import { UpdateMovieInput } from '../schemas/update-movie.schema'
import { ListMoviesInput } from '../schemas/list-movies.schema'

@Injectable()
export class MovieRepository {
	constructor(
		@Inject('DATABASE_POOL')
		private readonly db: Pool,
	) { }

	async create(dto: CreateMovieInput) {
		const { rows } = await this.db.query(
			`
			INSERT INTO movies (
				title, description, is_premiere, premiere_date, price,
				poster_url, video_url, download_unlocked_at, created_at, updated_at
			)
			VALUES (
				$1, $2, $3, $4, $5, $6, $7,
				CASE WHEN $4::timestamptz IS NOT NULL AND $8::int IS NOT NULL
					THEN $4::timestamptz + ($8::int || ' months')::interval
					ELSE NULL
				END,
				NOW(), NOW()
			)
			RETURNING *
			`,
			[
				dto.title,
				dto.description ?? null,
				dto.isPremiere,
				dto.premiereDate ?? null,
				dto.price ?? null,
				dto.posterUrl ?? null,
				dto.videoUrl ?? null,
				dto.downloadUnlockMonths ?? null,
			],
		)
		return rows[0]
	}

	// Sahifalash bilan bitta so'rov — N+1 yo'q. isDeleted bo'lmasa ham,
	// keyinchalik soft-delete qo'shilsa shu joyga is_deleted = false qo'shiladi.
	async findMany(filters: ListMoviesInput) {
		const conditions: string[] = []
		const params: any[] = []
		let idx = 1

		if (filters.search) {
			conditions.push(`title ILIKE $${idx++}`)
			params.push(`%${filters.search}%`)
		}

		if (filters.isPremiere !== undefined) {
			conditions.push(`is_premiere = $${idx++}`)
			params.push(filters.isPremiere)
		}

		const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
		const offset = (filters.page - 1) * filters.limit

		const dataQuery = this.db.query(
			`
			SELECT id, title, description, is_premiere, premiere_date, price,
				poster_url, download_unlocked_at, created_at
			FROM movies
			${where}
			ORDER BY created_at DESC
			LIMIT $${idx++} OFFSET $${idx++}
			`,
			[...params, filters.limit, offset],
		)

		const countQuery = this.db.query(
			`SELECT COUNT(*)::int AS total FROM movies ${where}`,
			params,
		)

		const [{ rows }, { rows: countRows }] = await Promise.all([dataQuery, countQuery])

		return {
			items: rows,
			total: countRows[0].total,
			page: filters.page,
			limit: filters.limit,
		}
	}

	async findById(id: string) {
		const { rows } = await this.db.query(
			`SELECT * FROM movies WHERE id = $1 LIMIT 1`,
			[id],
		)
		return rows[0]
	}

	async update(id: string, dto: UpdateMovieInput) {
		const fields: string[] = []
		const params: any[] = []
		let idx = 1

		for (const [key, value] of Object.entries(dto)) {
			if (value === undefined) continue
			const column = key === 'posterUrl' ? 'poster_url' : key === 'videoUrl' ? 'video_url' : key
			fields.push(`${column} = $${idx++}`)
			params.push(value)
		}

		if (fields.length === 0) {
			return this.findById(id)
		}

		fields.push(`updated_at = NOW()`)
		params.push(id)

		const { rows } = await this.db.query(
			`UPDATE movies SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
			params,
		)
		return rows[0]
	}

	async delete(id: string) {
		await this.db.query(`DELETE FROM movies WHERE id = $1`, [id])
	}
}
