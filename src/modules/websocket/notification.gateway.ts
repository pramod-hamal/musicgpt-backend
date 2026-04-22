import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Namespace } from 'socket.io';
import { SocketWithAuth } from 'src/common/interface/socket-with-auth';
@WebSocketGateway({
  namespace: 'notification',
})
export class NotificationGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer() namespace: Namespace;
  constructor() {}
  handleConnection(client: SocketWithAuth) {
    if (!client.user) {
      this.logger.warn('Unauthorized connection attempt');
      client.disconnect(true);
      return;
    }
    client.join(`user_${client.user.id}`);
    this.logger.log(`User ${client.user.id} connected to notification namespace`);
  }
  handleDisconnect(client: SocketWithAuth) {
    client.disconnect();
  }
  afterInit(server: SocketWithAuth) {
    this.logger.log('NotificationGateway initialized');
  }

  sendAudioProcessingUpdate(userId: number, status: string) {
    this.namespace.to(`user_${userId}`).emit('notification', { status });
  }
}
