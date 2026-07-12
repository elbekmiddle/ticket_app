import { Module } from '@nestjs/common'
import { ReviewController } from './controllers/review.controller'
import { ReviewService } from './services/review.service'
import { ReviewRepository } from './repositories/review.repository'
import { MoviesModule } from 'src/modules/movies/movies.module'

@Module({
	imports: [MoviesModule],
	controllers: [ReviewController],
	providers: [ReviewService, ReviewRepository],
})
export class ReviewsModule { }
