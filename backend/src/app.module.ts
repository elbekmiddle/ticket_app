import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module'
import { AuthModule } from 'src/modules/auth/auth.module'
import { RedisModule } from './redis/redis.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    RedisModule,
    MailModule,
    UsersModule
  ],
  providers: [],
})
export class AppModule {}
