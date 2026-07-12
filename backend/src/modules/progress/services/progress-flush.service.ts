import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { RedisService } from 'src/redis/redis.service'
import { ProgressRepository } from '../repositories/progress.repository'

// Hujjatdagi reja: "Har 1 daqiqada fondagi worker (Cron) Redis'dagi o'zgargan
// vaqtlarni yig'ib, PostgreSQL'dagi user_video_progress jadvaliga yozib qo'yadi."
@Injectable()
export class ProgressFlushService {
	private readonly logger = new Logger(ProgressFlushService.name)

	constructor(
		private readonly redisService: RedisService,
		private readonly progressRepository: ProgressRepository,
	) { }

	@Cron('*/1 * * * *')
	async flush() {
		const keys = await this.redisService.scanKeys('user:progress:*')

		if (keys.length === 0) return

		let flushed = 0

		for (const key of keys) {
			// key format: user:progress:{userId}:{movieId}
			const parts = key.split(':')
			const userId = parts[2]
			const movieId = parts[3]

			if (!userId || !movieId) continue

			const value = await this.redisService.get(key)
			if (value === null) continue

			try {
				await this.progressRepository.upsert(userId, movieId, Number(value))
				flushed++
			} catch (err) {
				this.logger.error(`Flush failed for ${key}`, err as Error)
			}
		}

		if (flushed > 0) {
			this.logger.debug(`Video progress flushed: ${flushed} key(s)`)
		}
	}
}
