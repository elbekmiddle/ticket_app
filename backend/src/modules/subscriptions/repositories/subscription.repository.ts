import { Inject, Injectable } from '@nestjs/common'
import { Pool } from 'pg'

@Injectable()
export class SubscriptionRepository {
	constructor(
		@Inject('DATABASE_POOL')
		private readonly db: Pool,
	) { }

	async findActiveByUserId(userId: string) {
		const { rows } = await this.db.query(
			`
			SELECT * FROM subscriptions
			WHERE user_id = $1 AND status = 'active' AND expires_at > NOW()
			ORDER BY expires_at DESC
			LIMIT 1
			`,
			[userId],
		)
		return rows[0]
	}

	async create(userId: string, plan: string, expiresAt: Date) {
		const { rows } = await this.db.query(
			`
			INSERT INTO subscriptions (user_id, plan, status, expires_at, created_at, updated_at)
			VALUES ($1, $2, 'active', $3, NOW(), NOW())
			RETURNING *
			`,
			[userId, plan, expiresAt],
		)
		return rows[0]
	}

	async cancel(userId: string) {
		// Auto-billing yo'q — "cancel" faqat statusni deaktivlaydi,
		// mavjud muddat oxirigacha foydalanish huquqi saqlanadi (odatiy SaaS praktikasi).
		// Bu yerda biz sodda qilib darhol expired qilamiz, chunki "auto-renew yo'q" model bunga to'g'ri keladi.
		const { rows } = await this.db.query(
			`
			UPDATE subscriptions
			SET status = 'cancelled', updated_at = NOW()
			WHERE user_id = $1 AND status = 'active'
			RETURNING *
			`,
			[userId],
		)
		return rows[0]
	}

	async findAllByUserId(userId: string) {
		const { rows } = await this.db.query(
			`SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC`,
			[userId],
		)
		return rows
	}
}
