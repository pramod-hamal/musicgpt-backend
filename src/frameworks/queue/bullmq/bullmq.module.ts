import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { IJobQueue } from 'src/core/abstracts/job-queue';
import { AudioUsecaseModule } from 'src/use-cases/audio/audio.usecase.module';
import { BullmqService } from './bullmq.service';
import { AudioProcessor } from './processors/audio.processor';
import { AUDIO_QUEUE } from './queues';

@Module({
  imports: [
    AudioUsecaseModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      },
    }),
    BullModule.registerQueue({
      name: AUDIO_QUEUE,
      defaultJobOptions: {
        removeOnComplete: true,
      },
    }),
  ],
  providers: [
    {
      provide: IJobQueue,
      useClass: BullmqService,
    },
    AudioProcessor,
  ],
  exports: [IJobQueue],
})
export class BullmqModule {}
