import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { PromptStatus } from 'src/common/enum/prompt-status.enum';
import { NotificationGateway } from 'src/modules/websocket/notification.gateway';
import { AudioUsecaseService } from 'src/use-cases/audio/audio.usecase.service';
import { AUDIO_QUEUE } from '../queues';

@Processor(AUDIO_QUEUE, {
  concurrency: 5,
  lockDuration: 120000, // 2 minutes (because audio generation delay can be between 20 to 80 seconds, we set lock duration to 2 minutes to be safe)
})
export class AudioProcessor extends WorkerHost {
  private readonly logger = new Logger(AudioProcessor.name);
  constructor(
    @InjectQueue(AUDIO_QUEUE) private readonly audioQueue: Queue,
    private readonly audoUsecaseService: AudioUsecaseService,
    private readonly notificationGateway: NotificationGateway,
  ) {
    super();
  }

  async process(job: Job<any, any, string>) {
    this.logger.debug(`Processing audio job with id: ${job.id} and data: ${JSON.stringify(job.data)}`);
    /**
     * simulate delay here. delay is between between 20 to 80 seconds
     */
    const delay = Math.floor(Math.random() * 60000) + 20000;
    await this.audoUsecaseService.processAudioGeneration(delay, job.data);
    this.notificationGateway.sendAudioProcessingUpdate(job.data.userId, PromptStatus.COMPLETED);
    this.logger.debug(`Completed audio job with id: ${job.id} after ${delay} ms`);
  }
}
