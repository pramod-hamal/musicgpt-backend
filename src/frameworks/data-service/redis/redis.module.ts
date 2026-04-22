import { Module } from '@nestjs/common';
import { ICacheService } from 'src/core/abstracts/cache.service';
import { ITokenBlacklistRepository } from 'src/core/abstracts/repositories/token-blacklist.repository';
import { RedisCacheService } from './redis-cache.service';
import { RedisTokenBlacklistRepository } from './redis-token-blacklist.repository';
import { RedisService } from './redis.service';

@Module({
  providers: [
    RedisService,
    RedisCacheService,
    {
      provide: ITokenBlacklistRepository,
      useClass: RedisTokenBlacklistRepository,
    },
    {
      provide: ICacheService,
      useClass: RedisCacheService,
    },
  ],
  exports: [
    {
      provide: ITokenBlacklistRepository,
      useClass: RedisTokenBlacklistRepository,
    },
    {
      provide: ICacheService,
      useClass: RedisCacheService,
    },
  ],
})
export class RedisModule {}
