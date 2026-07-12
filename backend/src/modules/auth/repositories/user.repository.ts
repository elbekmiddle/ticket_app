import { Inject, Injectable } from '@nestjs/common'
import { Pool } from 'pg'

@Injectable()
export class UserRepository {
	constructor(
		@Inject('DATABASE_POOL')
		private readonly db: Pool,
	) {}

	async findByEmail(email: string) {
		const { rows } = await this.db.query(
			`SELECT id, name, email, is_verified FROM users WHERE email = $1 LIMIT 1`,
			[email],
		)
		return rows[0]
	}

	async findByEmailWithPassword(email: string) {
		const { rows } = await this.db.query(
			`
			SELECT id, name, email, password, is_verified
			FROM users
			WHERE email = $1
			LIMIT 1
			`,
			[email],
		)
		return rows[0]
	}

	async findById(id: string) {
		const { rows } = await this.db.query(
			`SELECT id, name, email, is_verified FROM users WHERE id = $1 LIMIT 1`,
			[id],
		)
		return rows[0]
	}

	async createUser(name: string, email: string, password: string) {
		const { rows } = await this.db.query(
			`
			INSERT INTO users(name, email, password, is_verified, created_at, updated_at)
			VALUES ($1, $2, $3, false, NOW(), NOW())
			RETURNING id, name, email, is_verified
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
}
