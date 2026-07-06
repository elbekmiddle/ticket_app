import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module'
import { AuthModule } from 'src/modules/auth/auth.module'
import { RedisModule } from './redis/redis.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    RedisModule,
    MailModule
  ],
})
export class AppModule {}
