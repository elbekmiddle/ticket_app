import { Module } from '@nestjs/common'
import { ProgressController } from './controllers/progress.controller'
import { ProgressService } from './services/progress.service'
import { ProgressFlushService } from './services/progress-flush.service'
import { ProgressRepository } from './repositories/progress.repository'
import { MoviesModule } from 'src/modules/movies/movies.module'

@Module({
	imports: [MoviesModule],
	controllers: [ProgressController],
	providers: [ProgressService, ProgressFlushService, ProgressRepository],
})
export class ProgressModule { }
