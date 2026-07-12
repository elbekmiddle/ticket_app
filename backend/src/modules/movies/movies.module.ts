import { Module } from '@nestjs/common'
import { MovieController } from './controllers/movie.controller'
import { MovieService } from './services/movie.service'
import { MovieRepository } from './repositories/movie.repository'

@Module({
	controllers: [MovieController],
	providers: [MovieService, MovieRepository],
	exports: [MovieRepository],
})
export class MoviesModule { }
