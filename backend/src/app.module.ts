import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module'
import { AuthModule } from 'src/modules/auth/auth.module'
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    RedisModule,
    RedisModule
  ],
})
export class AppModule {}
