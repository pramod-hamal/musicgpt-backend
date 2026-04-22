import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ITokenBlacklistRepository } from 'src/core/abstracts/repositories/token-blacklist.repository';
import { RedisService } from './redis.service';

@Injectable()
export class RedisTokenBlacklistRepository implements ITokenBlacklistRepository {
  redisClient: Redis;
  constructor(private readonly redisService: RedisService) {
    this.redisClient = this.redisService.getClient();
  }
  async has(jti: string): Promise<boolean> {
    try {
      const key = `blacklist:${jti}`;
      const result = await this.redisClient.get(key);
      if (result) {
        return true;
      }
      return false;
    } catch (err) {
      console.log('Error checking token blacklist in Redis:', err);
      return false;
    }
  }

  async add(jti: string, exp: number): Promise<void> {
    try {

      const key = `blacklist:${jti}`;
      await this.redisClient.set(key, 'blacklisted', 'EX', exp);
    } catch (err) {
      console.log('Error adding token to blacklist in Redis:', err);
    }
  }
}
