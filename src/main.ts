import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { ValidationException } from './common/exception/validation.exception';
import { RedisService } from './frameworks/data-service/redis/redis.service';
import { RedisIoAdapter } from './frameworks/websocket/adapter/redis-io.adapter';
import { winstonLogger } from './logger/winston.logger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonLogger,
    }),
  });
  const port = process.env.PORT || 6001;
  // prefix
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
    // credentials: true,
  });

  //  validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        return new ValidationException(errors);
      },
    }),
  );

  app.use(cookieParser());

  const redisIoAdapter = new RedisIoAdapter(app);
  const pubClient = app.get(RedisService).getClient();
  const subClient = pubClient.duplicate();
  await redisIoAdapter.connectToRedis(pubClient, subClient);
  app.useWebSocketAdapter(redisIoAdapter);

  const config = new DocumentBuilder()
    .setTitle('MusicGPT API')
    .setDescription('API documentation for MusicGPT (not enough time to write: Proper postman collection will be provided)')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, () => {
    Logger.log(`Server running on port ${port}`, 'Bootstrap');
  });
}
bootstrap();
