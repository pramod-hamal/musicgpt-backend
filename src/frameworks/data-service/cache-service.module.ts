import { DynamicModule, Module } from '@nestjs/common';
import { ICacheOptions } from 'src/common/interface/cache.options.interface';
import { RedisModule } from './redis/redis.module';

@Module({})
export class CacheServiceModule {
  static async register(option: ICacheOptions): Promise<DynamicModule> {
    return {
      global: true,
      module: CacheServiceModule,
      imports: [RedisModule],
      exports: [RedisModule],
    };
  }
}
