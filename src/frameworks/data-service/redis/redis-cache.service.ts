import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ICacheService } from 'src/core/abstracts/cache.service';
import { RedisService } from './redis.service';

@Injectable()
export class RedisCacheService implements ICacheService {
  private readonly redisClient: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redisClient = this.redisService.getClient();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);
      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      Logger.error(`Failed to read cache key: ${key}`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlInSeconds?: number): Promise<void> {
    try {
      const payload = JSON.stringify(value);

      if (ttlInSeconds && ttlInSeconds > 0) {
        await this.redisClient.set(key, payload, 'EX', ttlInSeconds);
        return;
      }

      await this.redisClient.set(key, payload);
    } catch (error) {
      Logger.error(`Failed to write cache key: ${key}`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      Logger.error(`Failed to delete cache key: ${key}`, error);
    }
  }
}