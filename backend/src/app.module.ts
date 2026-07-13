import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
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
    ScheduleModule.forRoot(), // ProgressFlushService/DownloadUnlockService'dagi @Cron uchun kerak

    // Global default: bitta IP 1 daqiqada 60 so'rovdan ortiq yubora olmaydi.
    // Alohida endpoint'lar (login, resend-otp, forgot-password) buni @Throttle
    // bilan yanada qattiqroq qiladi (controller'larga qarang).
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }]),

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
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
