import { Injectable, NotFoundException } from '@nestjs/common'
import { RedisService } from 'src/redis/redis.service'
import { ProgressRepository } from '../repositories/progress.repository'
import { MovieRepository } from 'src/modules/movies/repositories/movie.repository'
import { SaveProgressInput } from '../schemas/save-progress.schema'
import { MovieErrorMessages } from 'src/config/errors'

// 7 kun — agar user videoni tashlab qo'ysa ham, Redis key abadiy saqlanib
// xotirani band qilib turmaydi. Bu orada cron worker allaqachon Postgres'ga
// flush qilib ulguradi (har 1 daqiqada), shuning uchun ma'lumot yo'qolmaydi.
const PROGRESS_TTL_SECONDS = 7 * 24 * 60 * 60

function progressKey(userId: string, movieId: string) {
	return `user:progress:${userId}:${movieId}`
}

@Injectable()
export class ProgressService {
	constructor(
		private readonly redisService: RedisService,
		private readonly progressRepository: ProgressRepository,
		private readonly movieRepository: MovieRepository,
	) { }

	// Frontend player har 5-10 soniyada shu endpoint'ni chaqiradi.
	// To'g'ridan-to'g'ri Postgres'ga yozmaymiz — Redis'ga yozamiz,
	// asosiy bazaga esa fon worker (@Cron, har 1 daqiqada) "flush" qiladi.
	async save(userId: string, dto: SaveProgressInput) {
		await this.redisService.set(
			progressKey(userId, dto.movieId),
			String(dto.positionSeconds),
			PROGRESS_TTL_SECONDS,
		)
		return { success: true }
	}

	async get(userId: string, movieId: string) {
		const movie = await this.movieRepository.findById(movieId)

		if (!movie) {
			throw new NotFoundException(MovieErrorMessages.MOVIE_NOT_FOUND)
		}

		const cached = await this.redisService.get(progressKey(userId, movieId))

		let positionSeconds = cached ? Number(cached) : 0

		if (!cached) {
			// Redis'da hali yo'q bo'lsa (masalan boshqa qurilmadan birinchi marta ochilmoqda) —
			// oxirgi flush qilingan qiymatni Postgres'dan olamiz.
			const saved = await this.progressRepository.find(userId, movieId)
			positionSeconds = saved?.last_position_seconds ?? 0
		}

		return {
			success: true,
			positionSeconds,
			// Eslatma: bu — <video> tegi to'g'ridan-to'g'ri qo'llab-quvvatlaydigan
			// "Media Fragment" URI (#t=), YouTube'dagi ?t= bilan bir xil emas (u YouTube'ga
			// xos konventsiya). HLS pleyer (hls.js/video.js) ishlatilsa, frontend
			// resumeUrl'ni emas, to'g'ridan-to'g'ri `positionSeconds`ni player.currentTime'ga
			// qo'yishi kerak — bu HLS uchun to'g'ri va yagona ishonchli usul.
			resumeUrl: movie.video_url ? `${movie.video_url}#t=${positionSeconds}` : null,
		}
	}
}
