import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisProvider } from 'src/redis/redis.provider'

@Global()
@Module({
  providers: [RedisService, RedisProvider],
  exports: [RedisService]
})
export class RedisModule {}
