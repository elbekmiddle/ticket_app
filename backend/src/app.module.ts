import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'
import { DatabaseModule } from 'src/database/database.module'
import { AuthModule } from 'src/modules/auth/auth.module'
import { MoviesModule } from 'src/modules/movies/movies.module'
import { SubscriptionsModule } from 'src/modules/subscriptions/subscriptions.module'
import { TicketsModule } from 'src/modules/tickets/tickets.module'
import { UsersModule } from 'src/modules/users/users.module'
import { ReviewsModule } from 'src/modules/reviews/reviews.module'
import { ProgressModule } from 'src/modules/progress/progress.module'
import { MediaModule } from 'src/modules/media/media.module'
import { RedisModule } from './redis/redis.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // ProgressFlushService'dagi @Cron uchun kerak
    DatabaseModule,
    RedisModule,
    MailModule,
    AuthModule,
    MoviesModule,
    SubscriptionsModule,
    TicketsModule,
    UsersModule,
    ReviewsModule,
    ProgressModule,
    MediaModule,
  ],
})
export class AppModule {}
