import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  redisClient: Redis;
  constructor() {
    this.initializeRedis();
  }

  initializeRedis() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      commandTimeout: 5000,
      autoResubscribe: true,
      reconnectOnError: (error) => {
        Logger.error('Error occurred while reconnecting to redis', error);
        return true;
      },
    });
    this.redisClient.on('connect', () => {
      Logger.log('Connected to Redis');
    });
  }
  public getClient(): Redis {
    return this.redisClient;
  }
}
