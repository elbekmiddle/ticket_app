import { Module } from '@nestjs/common'
import { TicketController } from './controllers/ticket.controller'
import { TicketService } from './services/ticket.service'
import { TicketRepository } from './repositories/ticket.repository'
import { DownloadUnlockService } from './services/download-unlock.service'
import { MoviesModule } from 'src/modules/movies/movies.module'
import { SubscriptionsModule } from 'src/modules/subscriptions/subscriptions.module'
import { AuthModule } from 'src/modules/auth/auth.module'

@Module({
	imports: [MoviesModule, SubscriptionsModule, AuthModule],
	controllers: [TicketController],
	providers: [TicketService, TicketRepository, DownloadUnlockService],
})
export class TicketsModule { }
