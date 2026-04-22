import { Global, Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Global()
@Module({
  imports: [],
  exports: [NotificationGateway],
  providers: [NotificationGateway],
})
export class WebsocketModule {}
