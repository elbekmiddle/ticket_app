import { Injectable, NotFoundException } from '@nestjs/common'
import { MovieRepository } from '../repositories/movie.repository'
import { CreateMovieInput } from '../schemas/create-movie.schema'
import { UpdateMovieInput } from '../schemas/update-movie.schema'
import { ListMoviesInput } from '../schemas/list-movies.schema'
import { MovieErrorMessages } from 'src/config/errors'

@Injectable()
export class MovieService {
	constructor(private readonly movieRepository: MovieRepository) { }

	async create(dto: CreateMovieInput) {
		const movie = await this.movieRepository.create(dto)
		return { success: true, movie }
	}

	async findMany(filters: ListMoviesInput) {
		const result = await this.movieRepository.findMany(filters)
		return { success: true, ...result }
	}

	async findById(id: string) {
		const movie = await this.movieRepository.findById(id)

		if (!movie) {
			throw new NotFoundException(MovieErrorMessages.MOVIE_NOT_FOUND)
		}

		return { success: true, movie }
	}

	async update(id: string, dto: UpdateMovieInput) {
		const existing = await this.movieRepository.findById(id)

		if (!existing) {
			throw new NotFoundException(MovieErrorMessages.MOVIE_NOT_FOUND)
		}

		const movie = await this.movieRepository.update(id, dto)
		return { success: true, movie }
	}

	async delete(id: string) {
		const existing = await this.movieRepository.findById(id)

		if (!existing) {
			throw new NotFoundException(MovieErrorMessages.MOVIE_NOT_FOUND)
		}

		await this.movieRepository.delete(id)
		return { success: true, message: 'Movie deleted' }
	}
}
