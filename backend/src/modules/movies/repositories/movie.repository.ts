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
				-- Ustunlik: aniq sana ($9) berilgan bo'lsa shu ishlatiladi.
				-- Bo'lmasa, premyera sanasi + N oy ($8) hisoblanadi. Ikkalasi ham bo'lmasa NULL.
				COALESCE(
					$9::timestamptz,
					CASE WHEN $4::timestamptz IS NOT NULL AND $8::int IS NOT NULL
						THEN $4::timestamptz + ($8::int || ' months')::interval
						ELSE NULL
					END
				),
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
				dto.downloadUnlockAt ?? null,
			],
		)
		return rows[0]
	}

	// Sahifalash bilan bitta so'rov — N+1 yo'q. Soft-delete: deleted_at IS NULL
	// har doim majburiy shart, shuning uchun uni conditions massiviga emas,
	// baseWhere'ga qo'yamiz — filtrlar bo'lmasa ham har doim qo'llanadi.
	async findMany(filters: ListMoviesInput) {
		const conditions: string[] = ['deleted_at IS NULL']
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

		const where = `WHERE ${conditions.join(' AND ')}`
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

	// deleted_at IS NULL shartisiz — o'chirilgan movie "topilmadi" deb qaytadi,
	// xuddi haqiqatan yo'q bo'lgandek (chaqiruvchi taraf farqni bilmaydi, va bilishi shart emas).
	async findById(id: string) {
		const { rows } = await this.db.query(
			`SELECT * FROM movies WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
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

			// downloadUnlockMonths — bu haqiqiy ustun emas, premiere_date orqali hisoblanadi.
			// Agar downloadUnlockAt HAM shu so'rovda berilgan bo'lsa, u ustun turadi —
			// shuning uchun downloadUnlockMonths'ni o'tkazib yuboramiz (pastda alohida ishlanadi).
			if (key === 'downloadUnlockMonths') continue

			const column =
				key === 'posterUrl' ? 'poster_url'
					: key === 'videoUrl' ? 'video_url'
					: key === 'downloadUnlockAt' ? 'download_unlocked_at'
					: key

			fields.push(`${column} = $${idx++}`)
			params.push(value)
		}

		// downloadUnlockMonths berilgan, lekin downloadUnlockAt berilmagan bo'lsa —
		// mavjud premiere_date'ga qo'shib SQL darajasida hisoblaymiz.
		if (dto.downloadUnlockMonths !== undefined && dto.downloadUnlockAt === undefined) {
			fields.push(`download_unlocked_at = premiere_date + ($${idx++} || ' months')::interval`)
			params.push(dto.downloadUnlockMonths)
		}

		if (fields.length === 0) {
			return this.findById(id)
		}

		fields.push(`updated_at = NOW()`)
		params.push(id)

		const { rows } = await this.db.query(
			`UPDATE movies SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
			params,
		)
		return rows[0]
	}

	// Haqiqiy DELETE emas — deleted_at = NOW(). Ma'lumot bazada qoladi.
	async softDelete(id: string) {
		await this.db.query(
			`UPDATE movies SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1`,
			[id],
		)
	}

	// Cron (ProgressFlushService'ga o'xshab) — vaqti kelgan (download_unlocked_at <= NOW())
	// va hali "unlocked" deb belgilanmagan kinolarni topadi. downloads_unlocked=FALSE
	// filtri tufayli har safar butun jadval emas, faqat "kutayotgan" qatorlar tekshiriladi.
	async findDueForDownloadUnlock() {
		const { rows } = await this.db.query(
			`
			SELECT id FROM movies
			WHERE download_unlocked_at IS NOT NULL
				AND download_unlocked_at <= NOW()
				AND downloads_unlocked = FALSE
				AND deleted_at IS NULL
			`,
		)
		return rows as { id: string }[]
	}

	async markDownloadsUnlocked(movieId: string) {
		await this.db.query(
			`UPDATE movies SET downloads_unlocked = TRUE WHERE id = $1`,
			[movieId],
		)
	}
}
