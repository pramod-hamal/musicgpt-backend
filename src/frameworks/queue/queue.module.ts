import { Global, Module } from '@nestjs/common';
import { BullmqModule } from './bullmq/bullmq.module';

@Global()
@Module({
  imports: [BullmqModule],
  exports: [BullmqModule],
})
export class QueueModule {}
