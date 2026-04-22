import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { ContextModule } from './frameworks/context/context.module';
import { CacheServiceModule } from './frameworks/data-service/cache-service.module';
import { DataServiceModule } from './frameworks/data-service/data-service.module';
import { QueueModule } from './frameworks/queue/queue.module';
import { SchedulerModule } from './frameworks/scheduler/scheduler.module';
import { AudioModule } from './modules/audio/audio.module';
import { AuthModule } from './modules/auth/auth.module';
import { PromptModule } from './modules/prompt/prompt.module';
import { SearchModule } from './modules/search/search.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { UserModule } from './modules/user/user.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { ThrottleUseCaseModule } from './use-cases/throttle/throttle-usecase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ContextModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
    }),
    CacheServiceModule.register({ type: 'redis', global: true }),
    DataServiceModule.register({ type: 'prisma', global: true }),
    WebsocketModule,
    SearchModule,
    QueueModule,
    SchedulerModule,
    UserModule,
    AuthModule,
    SubscriptionModule,
    PromptModule,
    AudioModule,
    ThrottleUseCaseModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
