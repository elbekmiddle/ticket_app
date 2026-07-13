import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ReviewRepository } from '../repositories/review.repository'
import { MovieRepository } from 'src/modules/movies/repositories/movie.repository'
import { CreateReviewInput } from '../schemas/create-review.schema'
import { ReviewErrorMessages } from 'src/config/errors'

@Injectable()
export class ReviewService {
	constructor(
		private readonly reviewRepository: ReviewRepository,
		private readonly movieRepository: MovieRepository,
	) { }

	async create(userId: string, dto: CreateReviewInput) {
		const movie = await this.movieRepository.findById(dto.movieId)

		if (!movie) {
			throw new NotFoundException(ReviewErrorMessages.MOVIE_NOT_FOUND)
		}

		const existing = await this.reviewRepository.findByUserAndMovie(userId, dto.movieId)

		if (existing) {
			throw new BadRequestException(ReviewErrorMessages.ALREADY_REVIEWED)
		}

		const review = await this.reviewRepository.create(userId, dto.movieId, dto.rating, dto.comment)
		return { success: true, review }
	}

	async findByMovie(movieId: string) {
		const items = await this.reviewRepository.findByMovie(movieId)
		return { success: true, items }
	}

	// ---- Admin-only ----

	async setPinned(reviewId: string, isPinned: boolean) {
		const existing = await this.reviewRepository.findById(reviewId)

		if (!existing) {
			throw new NotFoundException(ReviewErrorMessages.REVIEW_NOT_FOUND)
		}

		const review = await this.reviewRepository.setPinned(reviewId, isPinned)
		return { success: true, review }
	}

	// Admin har qanday sharhni o'chira oladi (moderation); egasi ham o'zinikini o'chira oladi.
	async delete(reviewId: string, requesterId: string, requesterIsAdmin: boolean) {
		const existing = await this.reviewRepository.findById(reviewId)

		if (!existing) {
			throw new NotFoundException(ReviewErrorMessages.REVIEW_NOT_FOUND)
		}

		if (!requesterIsAdmin && existing.user_id !== requesterId) {
			throw new ForbiddenException('NOT_REVIEW_OWNER')
		}

		await this.reviewRepository.softDelete(reviewId)
		return { success: true, message: 'Review deleted' }
	}
}
