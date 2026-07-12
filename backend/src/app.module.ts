import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module'
import { AuthModule } from 'src/modules/auth/auth.module'
import { MoviesModule } from 'src/modules/movies/movies.module'
import { SubscriptionsModule } from 'src/modules/subscriptions/subscriptions.module'
import { TicketsModule } from 'src/modules/tickets/tickets.module'
import { RedisModule } from './redis/redis.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    MailModule,
    AuthModule,
    MoviesModule,
    SubscriptionsModule,
    TicketsModule,
  ],
})
export class AppModule {}
