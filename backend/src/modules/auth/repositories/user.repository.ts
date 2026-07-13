import { Inject, Injectable } from '@nestjs/common'
import { Pool } from 'pg'

@Injectable()
export class UserRepository {
	constructor(
		@Inject('DATABASE_POOL')
		private readonly db: Pool,
	) {}

	// Barcha "find" metodlari deleted_at IS NULL bilan filtrlaydi — soft-deleted
	// user login qila olmaydi, topilmaydi, mavjud emasdek ko'rinadi (lekin qatordir DB'da qoladi).
	async findByEmail(email: string) {
		const { rows } = await this.db.query(
			`SELECT id, name, email, is_verified, tier, is_admin FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1`,
			[email],
		)
		return rows[0]
	}

	async findByEmailWithPassword(email: string) {
		const { rows } = await this.db.query(
			`
			SELECT id, name, email, password, is_verified, tier, is_admin
			FROM users
			WHERE email = $1 AND deleted_at IS NULL
			LIMIT 1
			`,
			[email],
		)
		return rows[0]
	}

	async findById(id: string) {
		const { rows } = await this.db.query(
			`SELECT id, name, email, is_verified, tier, is_admin, created_at FROM users WHERE id = $1 AND deleted_at IS NULL LIMIT 1`,
			[id],
		)
		return rows[0]
	}

	async createUser(name: string, email: string, password: string) {
		const { rows } = await this.db.query(
			`
			INSERT INTO users(name, email, password, is_verified, created_at, updated_at)
			VALUES ($1, $2, $3, false, NOW(), NOW())
			RETURNING id, name, email, is_verified, tier, is_admin
			`,
			[name, email, password],
		)
		return rows[0]
	}

	async verifyUser(id: string) {
		await this.db.query(
			`
			UPDATE users
			SET is_verified = true, verified_at = NOW(), updated_at = NOW()
			WHERE id = $1
			`,
			[id],
		)
	}

	async updatePassword(id: string, password: string) {
		await this.db.query(
			`
			UPDATE users
			SET password = $1, updated_at = NOW()
			WHERE id = $2
			`,
			[password, id],
		)
	}

	async updateName(id: string, name: string) {
		const { rows } = await this.db.query(
			`
			UPDATE users
			SET name = $1, updated_at = NOW()
			WHERE id = $2
			RETURNING id, name, email, is_verified, tier, is_admin
			`,
			[name, id],
		)
		return rows[0]
	}

	// Faqat admin manual ravishda chaqiradi (VIP/tier3 belgilash) YOKI
	// ticket.service.ts avtomatik ravishda tier1 -> tier2 ga oshirish uchun chaqiradi.
	async updateTier(id: string, tier: number) {
		const { rows } = await this.db.query(
			`
			UPDATE users
			SET tier = $1, updated_at = NOW()
			WHERE id = $2
			RETURNING id, name, email, tier, is_admin
			`,
			[tier, id],
		)
		return rows[0]
	}

	async findMany(page: number, limit: number) {
		const offset = (page - 1) * limit

		const dataQuery = this.db.query(
			`
			SELECT id, name, email, is_verified, tier, is_admin, created_at
			FROM users
			WHERE deleted_at IS NULL
			ORDER BY created_at DESC
			LIMIT $1 OFFSET $2
			`,
			[limit, offset],
		)
		const countQuery = this.db.query(
			`SELECT COUNT(*)::int AS total FROM users WHERE deleted_at IS NULL`,
		)

		const [{ rows }, { rows: countRows }] = await Promise.all([dataQuery, countQuery])

		return { items: rows, total: countRows[0].total, page, limit }
	}

	// Haqiqiy DELETE emas — deleted_at = NOW(). Email boshqa user tomonidan
	// qayta ishlatilishi mumkin bo'ladi (init.sql'dagi partial unique index tufayli).
	async softDelete(id: string) {
		await this.db.query(
			`UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1`,
			[id],
		)
	}
}
