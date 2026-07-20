import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisService {
	constructor(
		@Inject('REDIS_CLIENT')
		private readonly redis: Redis,
	) { }

	async set(key: string, value: string, ttl?: number) {
		if (ttl) {
			await this.redis.set(key, value, 'EX', ttl)
		} else {
			await this.redis.set(key, value)
		}
	}

	async get(key: string) {
		return this.redis.get(key)
	}

	async del(key: string) {
		return this.redis.del(key)
	}

	async exists(key: string) {
		return this.redis.exists(key)
	}

	async ttl(key: string) {
		return this.redis.ttl(key)
	}

	async incr(key: string) {
		return this.redis.incr(key)
	}

	async expire(key: string, ttl: number) {
		return this.redis.expire(key, ttl)
	}

	// `KEYS pattern` butun Redis'ni bloklaydi — production'da xavfli.
	// SCAN esa kursor orqali bosqichma-bosqich o'qiydi, boshqa so'rovlarni bloklamaydi.
	// Video-progress flush cron'i (har 1 daqiqada) shu metodni ishlatadi.
	async scanKeys(pattern: string): Promise<string[]> {
		const keys: string[] = []
		let cursor = '0'

		do {
			const [nextCursor, batch] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 200)
			cursor = nextCursor
			keys.push(...batch)
		} while (cursor !== '0')

		return keys
	}
}
