import { INestApplication, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { NextFunction } from 'express';
import { ServerOptions } from 'http';
import Redis from 'ioredis';
import { Socket } from 'socket.io';
import { SocketWithAuth } from 'src/common/interface/socket-with-auth';
import { IUserRepository } from 'src/core/abstracts/repositories/user.repository';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(readonly app: INestApplication) {
    super(app);
  }

  async connectToRedis(pubClient: Redis, subClient: Redis) {
    // await Promise.all([pubClient.connect(), subClient.connect()]);
    this.adapterConstructor = createAdapter(pubClient, subClient);
    Logger.debug('Connected to Redis for WebSocket adapter', 'RedisIoAdapter');
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    Logger.debug('WebSocket adapter initialized with Redis', 'RedisIoAdapter');

    const userRepository = this.app.get<IUserRepository>(IUserRepository);
    const jwtService = this.app.get<JwtService>(JwtService);
    server.of('/notification').use(createAuthMiddleware(userRepository, jwtService));
    return server;
  }
}

const createAuthMiddleware = (userRepository: IUserRepository, jwtService: JwtService) => {
  return async (socket: SocketWithAuth, next: NextFunction) => {
    try {
      const token = extractTokenFromHeader(socket);
      if (!token) {
        return next(new Error('Authentication token missing'));
      }
      const payload = jwtService.verify(token);
      const user = await userRepository.findByEmail(payload.sub);
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.user = user; // Attach user info to socket for later use

      next();
    } catch (error) {
      Logger.error('WebSocket authentication failed', error, 'RedisIoAdapter');
      next(new Error('Authentication error'));
    }
  };
};

function extractTokenFromHeader(socket: Socket): string | undefined {
  const [type, token] = socket?.handshake?.headers?.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
}
